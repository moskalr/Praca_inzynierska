package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.entity.*;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.NotManagerException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressExistException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.gradeException.RatingOutOfRangeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.gradeException.SameRatingUpdateException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AddressMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.ProductMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeAverageRatingMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.*;
import pl.lodz.p.it.socialfridgemicroservice.repository.*;
import pl.lodz.p.it.socialfridgemicroservice.service.SocialFridgeService;
import pl.lodz.p.it.socialfridgemicroservice.utils.GeometryUtils;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;

import java.time.LocalDateTime;
import java.util.*;

import static org.keycloak.util.JsonSerialization.mapper;

@Service
@RequiredArgsConstructor
public class SocialFridgeServiceImpl implements SocialFridgeService {
    private static final double DEGREES_PER_M = 111000.0;
    private static final double DISTANCE = 50.0;
    private static final double DEGREES_PER_KM = 111.0;
    private static final int MIN_RATING = 0;
    private static final int MAX_RATING = 5;
    private static final double DEFAULT_RATING = 0.0;
    private final SocialFridgeRepository socialFridgeRepository;
    private final SocialFridgeMapper socialFridgeMapper;
    private final AccountRepository accountRepository;
    private final AddressRepository addressRepository;
    private final GradeRepository gradeRepository;
    private final ObjectMapper objectMapper;
    private final EmailServiceImpl emailService;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final AddressMapper addressMapper;
    private final ETagCalculator eTagCalculator;
    private final SocialFridgeAverageRatingMapper socialFridgeAverageRatingMapper;
    private final SocialFridgeAverageRatingRepository socialFridgeAverageRatingRepository;

    @Override
    public SocialFridgeModel getSocialFridge(Long id) throws SocialFridgeNotFoundException {
        final SocialFridge socialFridge = socialFridgeRepository.findByIdWithAvailableProducts(id);

        throwIfSocialFridgeNotFound(socialFridge, id);

        final SocialFridgeModel socialFridgeModel = socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
        socialFridgeModel.setETag(eTagCalculator.calculateETagForEntity(socialFridge).getValue());
        return socialFridgeModel;
    }

    private void throwIfSocialFridgeNotFound(SocialFridge socialFridge, Long id) throws SocialFridgeNotFoundException {
        if (socialFridge == null) {
            throw new SocialFridgeNotFoundException(id);
        }
    }

    @Override
    public List<SocialFridgeModel> getAllSocialFridges(List<SocialFridgeState> states) {
        return socialFridgeRepository.findByStates(states).stream().map(socialFridgeMapper::socialFridgeToSocialFridgeModel).toList();
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public SocialFridgeModel addSocialFridge(SocialFridgeModel socialFridgeModel) throws AccountNotFoundException, AddressExistException {
        final Account account = accountRepository.findByUsername(socialFridgeModel.getUsername())
                .orElseThrow(() -> new AccountNotFoundException(socialFridgeModel.getUsername()));

        throwIfAddressExist(socialFridgeModel.getAddress().getLatitude(), socialFridgeModel.getAddress().getLongitude());
        final Address address = new Address(socialFridgeModel.getAddress().getStreet(),
                socialFridgeModel.getAddress().getBuildingNumber(), socialFridgeModel.getAddress().getCity(),
                socialFridgeModel.getAddress().getPostalCode(), socialFridgeModel.getAddress().getLatitude(),
                socialFridgeModel.getAddress().getLongitude());
        addressRepository.save(address);
        final SocialFridgeAverageRating socialFridgeAverageRating = new SocialFridgeAverageRating();
        socialFridgeAverageRatingRepository.save(socialFridgeAverageRating);
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setAddress(address);
        socialFridge.setAccount(account);
        socialFridge.setSocialFridgeAverageRating(socialFridgeAverageRating);
        socialFridgeRepository.save(socialFridge);

        return socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
    }

    private void throwIfAddressExist(String latitude, String longitude) throws AddressExistException {
        Optional<Address> existingAddress = addressRepository.findByLatitudeAndLongitude(latitude, longitude);
        if (existingAddress.isPresent()) {
            throw new AddressExistException();
        }
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public SocialFridgeModel patchSocialFridge(Long id, JsonPatch jsonPatch) throws SocialFridgeNotFoundException, JsonPatchException, SameRatingUpdateException, InactiveSocialFridgeException, JsonProcessingException, RatingOutOfRangeException, DeletedSocialFridgeModificationException, NotManagerException, AccountNotFoundException, OutdatedDataException {
        final SocialFridge socialFridge = socialFridgeRepository.findById(id).orElseThrow(
                () -> new SocialFridgeNotFoundException(id)
        );

        SocialFridgeModel patchedSocialFridgeModel = socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
        String originalJson = objectMapper.writeValueAsString(patchedSocialFridgeModel);
        JsonNode patchedNode = jsonPatch.apply(mapper.readTree(originalJson));
        patchedSocialFridgeModel = objectMapper.treeToValue(patchedNode, SocialFridgeModel.class);

        return checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge);
    }

    @Override
    public List<SocialFridgeModel> getSocialFridgesWithinDistance(String latitude, String longitude, Double maxDistanceKm) {
        final Point userPoint = GeometryUtils.createPoint(latitude, longitude);
        final List<SocialFridge> allSocialFridges = socialFridgeRepository.findByState(SocialFridgeState.ACTIVE);
        List<SocialFridge> fridgesWithinDistance = new ArrayList<>();
        maxDistanceKm /= DEGREES_PER_KM;

        if (!allSocialFridges.isEmpty()) {
            for (SocialFridge socialFridge : allSocialFridges) {
                Point fridgePoint = GeometryUtils.createPoint(socialFridge.getAddress().getLatitude(), socialFridge.getAddress().getLongitude());

                double distance = userPoint.distance(fridgePoint);

                if (distance <= maxDistanceKm) {
                    fridgesWithinDistance.add(socialFridge);
                }
            }
        }

        return fridgesWithinDistance.stream().map(socialFridgeMapper::socialFridgeToSocialFridgeModel).toList();
    }

    @Override
    public List<SocialFridgeStatisticModel> getStatistics(int months) {
        final LocalDateTime cutoffDateTime = LocalDateTime.now().minusMonths(months);
        final List<SocialFridge> socialFridges = socialFridgeRepository.findAll();
        final List<SocialFridgeStatisticModel> socialFridgeStatisticInfoList = new ArrayList<>();
        for (SocialFridge socialFridge : socialFridges) {
            Map<Category, Integer> categoryCounts = initializeCategoryCounts();

            int archivedByUserCount = 0;
            int archivedBySystemCount = 0;
            double donatedFoodWeigh = 0.0;
            double wasteFoodWeigh = 0.0;
            double savedFoodWeigh = 0.0;
            int donatedFoodCount = 0;
            for (Product product : socialFridge.getProducts()) {
                if (product.getCreationDateTime().isAfter(cutoffDateTime)) {
                    if (product.getState() == ProductState.ARCHIVED_BY_USER) {
                        archivedByUserCount++;
                        savedFoodWeigh += product.getSize();
                    } else if (product.getState() == ProductState.ARCHIVED_BY_SYSTEM) {
                        archivedBySystemCount++;
                        wasteFoodWeigh += product.getSize();
                    }
                    donatedFoodWeigh += product.getSize();
                    updateCategoryCount(categoryCounts, product.getCategories());
                    donatedFoodCount++;
                }
            }

            final SocialFridgeStatisticModel socialFridgeStatisticModel = new SocialFridgeStatisticModel(
                    socialFridge.getId(),
                    addressMapper.addressToAddressModel(socialFridge.getAddress()),
                    socialFridge.getState(),
                    socialFridgeAverageRatingMapper.averageRatingToAverageRatingModel(socialFridge.getSocialFridgeAverageRating()),
                    donatedFoodCount,
                    archivedByUserCount,
                    archivedBySystemCount,
                    donatedFoodWeigh,
                    savedFoodWeigh,
                    wasteFoodWeigh,
                    categoryCounts
            );
            socialFridgeStatisticInfoList.add(socialFridgeStatisticModel);
        }
        return socialFridgeStatisticInfoList;
    }

    private static Map<Category, Integer> initializeCategoryCounts() {
        Map<Category, Integer> categoryCounts = new HashMap<>();
        for (Category category : Category.values()) {
            categoryCounts.put(category, 0);
        }
        return categoryCounts;
    }

    private static void updateCategoryCount(Map<Category, Integer> categoryCounts, Set<Category> productCategories) {
        for (Category category : productCategories) {
            categoryCounts.put(category, categoryCounts.get(category) + 1);
        }
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public void sendUpdateSocialFridgeNotification(UpdateSocialFridgeModel updateSocialFridgeModel) throws SocialFridgeNotFoundException, MessagingException, InvalidDistanceFromSocialFridgeException, AccountNotFoundException {
        final SocialFridge socialFridge = socialFridgeRepository.findById(updateSocialFridgeModel.getSocialFridgeId()).orElseThrow(
                () -> new SocialFridgeNotFoundException(updateSocialFridgeModel.getSocialFridgeId())
        );

        final Point productPoint = GeometryUtils.createPoint(updateSocialFridgeModel.getLatitude(), updateSocialFridgeModel.getLongitude());
        final Point fridgePoint = GeometryUtils.createPoint(socialFridge.getAddress().getLatitude(), socialFridge.getAddress().getLongitude());
        throwIfInvalidDistance(productPoint, fridgePoint, updateSocialFridgeModel.getSocialFridgeId());

        final List<ProductModel> products = productRepository.findAllByIdIn(updateSocialFridgeModel.getProducts())
                .stream()
                .map(productMapper::productToProductModel)
                .toList();

        emailService.sendUpdateNotificationToManager(socialFridge.getAccount().getEmail(), updateSocialFridgeModel.getSocialFridgeId(), socialFridge.getAddress().getBuildingNumber(),
                socialFridge.getAddress().getStreet(), socialFridge.getAddress().getCity(), products, updateSocialFridgeModel.getImage(),
                updateSocialFridgeModel.getDescription(), socialFridge.getAccount().getLanguage());

        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();
        final Account account = accountRepository.findByUsername(currentPrincipalName).orElseThrow(
                () -> new AccountNotFoundException(currentPrincipalName)
        );
        account.setUpdateCounter(account.getUpdateCounter() + 1);
        accountRepository.save(account);
    }

    @Override
    public List<SocialFridgeModel> getAllManagedSocialFridges(Pageable pageable, List<SocialFridgeState> states) throws AccountNotFoundException {
        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();

        final Account account = accountRepository.findByUsername(currentPrincipalName).orElseThrow(
                () -> new AccountNotFoundException(currentPrincipalName)
        );

        return socialFridgeRepository.findManagedSocialFridges(states, account.getId(), pageable)
                .stream()
                .map(socialFridgeMapper::socialFridgeToSocialFridgeModel)
                .toList();
    }

    @Override
    public GradeModel getSelfSocialFridgeRating(Long id) throws SocialFridgeNotFoundException {
        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();

        final SocialFridge socialFridge = socialFridgeRepository.findById(id).orElseThrow(
                () -> new SocialFridgeNotFoundException(id)
        );
        for (Grade grade : socialFridge.getGrades()) {
            if (grade.getCreatedBy().equals(currentPrincipalName)) {
                return new GradeModel(grade.getRating(), eTagCalculator.calculateETagForEntity(grade).getValue());
            }
        }
        return new GradeModel();
    }

    private void throwIfInvalidDistance(Point productPoint, Point fridgePoint, Long id) throws InvalidDistanceFromSocialFridgeException {
        if (productPoint.distance(fridgePoint) > DISTANCE / DEGREES_PER_M) {
            throw new InvalidDistanceFromSocialFridgeException(id);
        }
    }

    SocialFridgeModel checkUpdateLogicBusiness(SocialFridgeModel patchedSocialFridgeModel, SocialFridge socialFridge) throws SameRatingUpdateException, InactiveSocialFridgeException, RatingOutOfRangeException, DeletedSocialFridgeModificationException, NotManagerException, AccountNotFoundException, OutdatedDataException {
        if (patchedSocialFridgeModel.getRating() != DEFAULT_RATING) {
            return changeGrade(patchedSocialFridgeModel.getRating(), socialFridge);
        }

        if (!patchedSocialFridgeModel.getState().equals(socialFridge.getState())) {
            if (!eTagCalculator.verifyProvidedETag(socialFridge)) {
                throw new OutdatedDataException();
            }

            return updateSocialFridgeState(socialFridge, patchedSocialFridgeModel.getState());
        }

        if (patchedSocialFridgeModel.getUsername() != null && !Objects.equals(patchedSocialFridgeModel.getUsername(), socialFridge.getAccount().getUsername())) {
            if (!eTagCalculator.verifyProvidedETag(socialFridge)) {
                throw new OutdatedDataException();
            }

            return changeAccount(patchedSocialFridgeModel.getUsername(), socialFridge);
        }

        return socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
    }

    private SocialFridgeModel updateSocialFridgeState(SocialFridge socialFridge, SocialFridgeState flag) {
        socialFridge.setState(flag);
        socialFridgeRepository.save(socialFridge);
        return socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
    }

    private SocialFridgeModel changeAccount(String username, SocialFridge socialFridge) throws DeletedSocialFridgeModificationException, AccountNotFoundException, NotManagerException {
        throwIfArchive(socialFridge.getState(), socialFridge.getId());

        final Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AccountNotFoundException(username));

        throwIfNotManager(account);

        socialFridge.setAccount(account);
        socialFridgeRepository.save(socialFridge);
        return socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
    }

    private void throwIfNotManager(Account account) throws NotManagerException {
        if (!account.getRoles().contains(Roles.MANAGER)) {
            throw new NotManagerException(account.getUsername());
        }
    }

    private SocialFridgeModel changeGrade(Float rating, SocialFridge socialFridge) throws SameRatingUpdateException, InactiveSocialFridgeException, RatingOutOfRangeException, DeletedSocialFridgeModificationException, OutdatedDataException {
        throwIfArchive(socialFridge.getState(), socialFridge.getId());
        throwIfInactive(socialFridge.getState(), socialFridge.getId());
        throwIfRatingOutOfRange(rating);

        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();
        final Grade foundGrade = socialFridge.getGrades()
                .stream()
                .filter(grade -> grade.getCreatedBy().equals(currentPrincipalName))
                .findFirst()
                .orElse(null);

        if (foundGrade == null) {
            Grade grade = new Grade(rating);
            gradeRepository.save(grade);
            socialFridge.getGrades().add(grade);
            return changeAverageRating(socialFridge);
        }

        if (!eTagCalculator.verifyProvidedETag(foundGrade)) {
            throw new OutdatedDataException();
        }

        throwIfSameRating(foundGrade.getRating(), rating);

        foundGrade.setRating(rating);
        gradeRepository.save(foundGrade);
        return changeAverageRating(socialFridge);
    }

    private SocialFridgeModel changeAverageRating(SocialFridge socialFridge) {
        final Float sumOfRatings = socialFridge.getGrades().stream()
                .map(Grade::getRating)
                .reduce(0f, Float::sum);
        final Float averageRating = sumOfRatings / socialFridge.getGrades().size();
        socialFridge.getSocialFridgeAverageRating().setAverageRating(averageRating);
        socialFridgeRepository.save(socialFridge);
        return socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge);
    }

    private void throwIfArchive(SocialFridgeState state, Long id) throws DeletedSocialFridgeModificationException {
        if (SocialFridgeState.ARCHIVED.equals(state)) {
            throw new DeletedSocialFridgeModificationException(id);
        }
    }

    private void throwIfInactive(SocialFridgeState state, Long id) throws InactiveSocialFridgeException {
        if (SocialFridgeState.INACTIVE.equals(state)) {
            throw new InactiveSocialFridgeException(id);
        }
    }

    private void throwIfRatingOutOfRange(float rating) throws RatingOutOfRangeException {
        if (rating <= MIN_RATING || rating > MAX_RATING) {
            throw new RatingOutOfRangeException(rating);
        }
    }

    private void throwIfSameRating(Float existingRating, Float newRating) throws SameRatingUpdateException {
        if (Objects.equals(existingRating, newRating)) {
            throw new SameRatingUpdateException(newRating);
        }
    }
}


