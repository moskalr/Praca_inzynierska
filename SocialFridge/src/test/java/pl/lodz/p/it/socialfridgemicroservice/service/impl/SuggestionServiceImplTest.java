package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.github.javafaker.Faker;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.entity.Suggestion;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.NotFridgeManagerException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException.OldSuggestionModificationException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SuggestionMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.SuggestionModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SocialFridgeRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SuggestionRepository;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import jakarta.ws.rs.core.EntityTag;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class SuggestionServiceImplTest {
    @Mock
    private SuggestionRepository suggestionRepository;

    @Mock
    private SuggestionMapper suggestionMapper;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private SocialFridgeRepository socialFridgeRepository;

    @Mock
    private ETagCalculator eTagCalculator;

    @InjectMocks
    private SuggestionServiceImpl suggestionService;

    private final Faker faker = new Faker();

    private Account createRandomAccount() {
        List<String> roles = new ArrayList<>();
        roles.add(Roles.USER);

        return new Account(faker.name().username(), faker.name().firstName(), faker.name().lastName(), faker.internet().emailAddress(), faker.random().nextBoolean(), 0, Language.EN, new ArrayList<>(), new HashSet<>(), roles);
    }

    @Test
    void testGetAllManagedFridgeSuggestions() throws AccountNotFoundException {
        final Account account = createRandomAccount();
        final Boolean isNew = faker.bool().bool();
        final PageRequest pageable = PageRequest.of(0, 10);
        final List<Suggestion> suggestionsFromRepository = Arrays.asList(new Suggestion(), new Suggestion());
        SuggestionModel suggestionModel1 = new SuggestionModel();
        suggestionModel1.setETag("");
        SuggestionModel suggestionModel2 = new SuggestionModel();
        suggestionModel2.setETag("");
        final List<SuggestionModel> suggestionModels = Arrays.asList(suggestionModel1, suggestionModel2);

        when(accountRepository.findByUsername(any())).thenReturn(Optional.of(account));
        when(suggestionRepository.findSuggestionsForCurrentUser(account.getId(), pageable, isNew)).thenReturn(suggestionsFromRepository);

        when(suggestionMapper.suggestionToSuggestionModel(any())).thenReturn(suggestionModels.get(0), suggestionModels.toArray(new SuggestionModel[0]));

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(RandomStringUtils.randomAlphanumeric(8));
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(eTagCalculator.calculateETagForEntity(any())).thenReturn(EntityTag.valueOf(""));

        final List<SuggestionModel> result = suggestionService.getAllManagedFridgeSuggestions(pageable, isNew);

        verify(suggestionRepository, times(1)).findSuggestionsForCurrentUser(account.getId(), pageable, isNew);

        verify(suggestionMapper, times(suggestionsFromRepository.size())).suggestionToSuggestionModel(any());

        assertEquals(suggestionModels, result);
    }

    @Test
    void testGetAllManagedFridgeSuggestionsThrowsAccountNotFoundException() {
        final PageRequest pageable = PageRequest.of(0, 10);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(RandomStringUtils.randomAlphanumeric(8));
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(accountRepository.findByUsername(any())).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> suggestionService.getAllManagedFridgeSuggestions(pageable, true));

        verify(accountRepository, times(1)).findByUsername(any());
    }

    @Test
    void testAddSuggestion() {
        final String latitude = "51.1234";
        final String longitude = "19.5678";

        final SuggestionModel suggestionModel = new SuggestionModel();

        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ACTIVE);
        final Address address = new Address();
        address.setLatitude("51.1235");
        address.setLongitude("19.5678");
        socialFridge.setAddress(address);

        when(socialFridgeRepository.findById(suggestionModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        Assertions.assertDoesNotThrow(() -> suggestionService.addSuggestion(suggestionModel, latitude, longitude));

        verify(socialFridgeRepository, times(1)).findById(suggestionModel.getSocialFridgeId());
        verify(suggestionRepository, times(1)).save(any(Suggestion.class));
    }

    @Test
    void testAddSuggestionSocialFridgeNotFoundException() {
        final String latitude = "51.1234";
        final String longitude = "19.5678";

        final SuggestionModel suggestionModel = new SuggestionModel();

        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ACTIVE);
        final Address address = new Address();
        address.setLatitude("51.1235");
        address.setLongitude("19.5678");
        socialFridge.setAddress(address);

        when(socialFridgeRepository.findById(suggestionModel.getSocialFridgeId())).thenReturn(Optional.empty());

        assertThrows(SocialFridgeNotFoundException.class, () -> suggestionService.addSuggestion(suggestionModel, latitude, longitude));

        verify(socialFridgeRepository, times(1)).findById(suggestionModel.getSocialFridgeId());
    }

    @Test
    void testAddSuggestionInvalidDistanceFromSocialFridgeException() {
        final String latitude = "31.1234";
        final String longitude = "16.5678";

        final SuggestionModel suggestionModel = new SuggestionModel();

        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ACTIVE);
        final Address address = new Address();
        address.setLatitude("51.1235");
        address.setLongitude("19.5678");
        socialFridge.setAddress(address);

        when(socialFridgeRepository.findById(suggestionModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        assertThrows(InvalidDistanceFromSocialFridgeException.class, () -> suggestionService.addSuggestion(suggestionModel, latitude, longitude));

        verify(socialFridgeRepository, times(1)).findById(suggestionModel.getSocialFridgeId());
    }

    @Test
    void testAddSuggestionDeletedSocialFridgeModificationException() {
        final String latitude = "51.1234";
        final String longitude = "19.5678";

        final SuggestionModel suggestionModel = new SuggestionModel();

        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ARCHIVED);
        final Address address = new Address();
        address.setLatitude("51.1235");
        address.setLongitude("19.5678");
        socialFridge.setAddress(address);

        when(socialFridgeRepository.findById(suggestionModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        assertThrows(DeletedSocialFridgeModificationException.class, () -> suggestionService.addSuggestion(suggestionModel, latitude, longitude));

        verify(socialFridgeRepository, times(1)).findById(suggestionModel.getSocialFridgeId());
    }

    @Test
    void testAddSuggestionInactiveSocialFridgeException() {
        final String latitude = "51.1234";
        final String longitude = "19.5678";

        final SuggestionModel suggestionModel = new SuggestionModel();

        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.INACTIVE);
        final Address address = new Address();
        address.setLatitude("51.1235");
        address.setLongitude("19.5678");
        socialFridge.setAddress(address);

        when(socialFridgeRepository.findById(suggestionModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        assertThrows(InactiveSocialFridgeException.class, () -> suggestionService.addSuggestion(suggestionModel, latitude, longitude));

        verify(socialFridgeRepository, times(1)).findById(suggestionModel.getSocialFridgeId());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeFavCategories() {
        final Account account = new Account();
        final Suggestion suggestion = new Suggestion();
        suggestion.setIsNew(true);
        final SuggestionModel suggestionModel = new SuggestionModel();
        suggestionModel.setIsNew(false);

        final SocialFridge socialFridge = new SocialFridge();

        socialFridge.setAccount(account);
        suggestion.setSocialFridge(socialFridge);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Assertions.assertDoesNotThrow(() -> suggestionService.checkUpdateLogicBusiness(suggestionModel, suggestion));

        verify(suggestionMapper, times(1)).suggestionToSuggestionModel(suggestion);
        verify(suggestionRepository, times(1)).save(suggestion);
    }

    @Test
    void testCheckUpdateLogicBusinessChangeFavCategoriesNoChange() {
        final Account account = new Account();
        final Suggestion suggestion = new Suggestion();
        suggestion.setIsNew(true);
        final SuggestionModel suggestionModel = new SuggestionModel();
        suggestionModel.setIsNew(true);

        final SocialFridge socialFridge = new SocialFridge();

        socialFridge.setAccount(account);
        suggestion.setSocialFridge(socialFridge);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Assertions.assertDoesNotThrow(() -> suggestionService.checkUpdateLogicBusiness(suggestionModel, suggestion));

        verify(suggestionMapper, times(1)).suggestionToSuggestionModel(suggestion);
        verifyNoInteractions(suggestionRepository);
    }

    @Test
    void testCheckUpdateLogicBusinessChangeFavCategoriesOldSuggestionModificationException() {
        final Account account = new Account();
        final Suggestion suggestion = new Suggestion();
        suggestion.setIsNew(false);
        final SuggestionModel suggestionModel = new SuggestionModel();
        suggestionModel.setIsNew(!suggestion.getIsNew());

        final SocialFridge socialFridge = new SocialFridge();

        socialFridge.setAccount(account);
        suggestion.setSocialFridge(socialFridge);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(OldSuggestionModificationException.class, () -> suggestionService.checkUpdateLogicBusiness(suggestionModel, suggestion));
    }

    @Test
    void testCheckUpdateLogicBusinessChangeFavCategoriesNotFridgeManagerException() {
        final Account account = new Account();
        final Suggestion suggestion = new Suggestion();
        suggestion.setIsNew(true);
        final SuggestionModel suggestionModel = new SuggestionModel();
        suggestionModel.setIsNew(!suggestion.getIsNew());

        final SocialFridge socialFridge = new SocialFridge();

        socialFridge.setAccount(account);
        suggestion.setSocialFridge(socialFridge);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(RandomStringUtils.randomAlphanumeric(8));
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(NotFridgeManagerException.class, () -> suggestionService.checkUpdateLogicBusiness(suggestionModel, suggestion));
    }
}