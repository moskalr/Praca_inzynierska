package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AccountMapper;
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.ProductRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static pl.lodz.p.it.socialfridgemicroservice.config.Roles.ELITE_USER;
import static pl.lodz.p.it.socialfridgemicroservice.kafka.AccountSerializerDeserializer.serializeUser;

@EnableAsync
@Component
@RequiredArgsConstructor
public class SystemScheduler {
    private static final String DAILY_CRON = "0 0 0 * * *";
    private static final String MONTH_CRON = "0 1 0 1 * ?";

    private static final String UPDATE_TOPIC_SF = "update_account_SF";
    private final EmailServiceImpl emailService;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final AccountMapper accountMapper;

    @Async
    @Scheduled(cron = DAILY_CRON)
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public void deleteExpiredProducts() throws MessagingException {
        final List<Product> products = productRepository.findByState(ProductState.AVAILABLE);
        final LocalDate today = LocalDate.now();

        for (Product product : products) {
            LocalDate expirationDate = product.getExpirationDate().toLocalDate();
            if (expirationDate.isBefore(today)) {
                product.setState(ProductState.ARCHIVED_BY_SYSTEM);
                productRepository.save(product);
                emailService.sendExpirationNotificationToManager(product.getSocialFridge().getAccount().getEmail(),
                        product.getTitle(), product.getId(), product.getSocialFridge().getAddress().getBuildingNumber(),
                        product.getSocialFridge().getAddress().getStreet(), product.getSocialFridge().getAddress().getCity(),
                        product.getSocialFridge().getAccount().getLanguage());
            }
        }
    }

    @Async
    @Scheduled(cron = MONTH_CRON)
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public void dynamicallyGrantAccessLevel() throws JsonProcessingException, MessagingException {
        List<Account> accounts = accountRepository.findAll();

        for (Account account : accounts) {
            if (account.getUpdateCounter() >= 5) {
                if (!account.getRoles().contains(ELITE_USER)) {
                    account.getRoles().add(ELITE_USER);
                    final String userJson = serializeUser(accountMapper.accountToAccountModel(account));
                    kafkaTemplate.send(UPDATE_TOPIC_SF, userJson);
                    emailService.addEliteUserAccessLevel(account.getFirstName(), account.getLastName(),
                            account.getEmail(), account.getLanguage());
                }
            } else if (account.getRoles().contains(ELITE_USER)) {
                account.getRoles().remove(ELITE_USER);
                final String userJson = serializeUser(accountMapper.accountToAccountModel(account));
                kafkaTemplate.send(UPDATE_TOPIC_SF, userJson);
                emailService.removeEliteUserAccessLevel(account.getFirstName(), account.getLastName(),
                        account.getEmail(), account.getLanguage());
            }
            account.setUpdateCounter(0);
            accountRepository.save(account);
        }
    }
}