package pl.lodz.p.it.accountmicroservice.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import pl.lodz.p.it.accountmicroservice.exception.account.AccountNotFoundException;
import pl.lodz.p.it.accountmicroservice.exception.account.KeycloakClientNotFoundException;
import pl.lodz.p.it.accountmicroservice.service.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class Consumer {
    private static final String GROUP_ID = "account";
    private static final String REMOVE_TOPIC_E = "remove_account_E";
    private static final String REMOVE_TOPIC_PF = "remove_account_PF";
    private static final String REMOVE_TOPIC_EF = "remove_account_EF";
    private static final String REMOVE_TOPIC_SF = "remove_account_SF";
    private static final String UPDATE_TOPIC_E = "update_account_E";
    private static final String UPDATE_TOPIC_PF = "update_account_PF";
    private static final String UPDATE_TOPIC_EF = "update_account_EF";
    private static final String UPDATE_TOPIC_SF = "update_account_SF";

    private final AccountService accountService;

    @KafkaListener(topics = {UPDATE_TOPIC_E, UPDATE_TOPIC_PF, UPDATE_TOPIC_EF, UPDATE_TOPIC_SF}, groupId = GROUP_ID)
    public void consumeUpdateAccount(String message) throws JsonProcessingException, KeycloakClientNotFoundException, AccountNotFoundException {
        accountService.updateAccount(message);
    }

    @KafkaListener(topics = {REMOVE_TOPIC_E, REMOVE_TOPIC_PF, REMOVE_TOPIC_EF, REMOVE_TOPIC_SF}, groupId = GROUP_ID)
    public void consumeRemoveAccount(String message) throws AccountNotFoundException, JsonProcessingException {
        accountService.removeAccount(message);
    }
}
