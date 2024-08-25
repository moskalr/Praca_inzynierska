package pl.lodz.p.it.socialfridgemicroservice.kafka.consume;

import com.fasterxml.jackson.core.JsonProcessingException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import pl.lodz.p.it.socialfridgemicroservice.service.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import pl.lodz.p.it.socialfridgemicroservice.kafka.AccountSerializerDeserializer;

@Service
@AllArgsConstructor
public class Consumer {
    private static final String CREATE_TOPIC = "create_account";
    private static final String REMOVE_TOPIC_E = "remove_account_E";
    private static final String REMOVE_TOPIC_PF = "remove_account_PF";
    private static final String REMOVE_TOPIC_EF = "remove_account_EF";
    private static final String UPDATE_TOPIC_E = "update_account_E";
    private static final String UPDATE_TOPIC_PF = "update_account_PF";
    private static final String UPDATE_TOPIC_EF = "update_account_EF";
    private static final String UPDATE_TOPIC_A = "update_account_A";
    private static final String GROUP_ID = "socialFridge";

    private final AccountService accountService;

    @KafkaListener(topics = {UPDATE_TOPIC_E, UPDATE_TOPIC_EF, UPDATE_TOPIC_PF, UPDATE_TOPIC_A}, groupId = GROUP_ID)
    public void consumeMessage(String message) throws JsonProcessingException, AccountNotFoundException {
        AccountModel accountModel = AccountSerializerDeserializer.deserializeUser(message);
        accountService.updateAccount(message);
    }

    @KafkaListener(topics = CREATE_TOPIC, groupId = GROUP_ID)
    public void consumeCreateAccount(String message) throws JsonProcessingException {
        accountService.createAccount(message);
    }

    @KafkaListener(topics = {REMOVE_TOPIC_E, REMOVE_TOPIC_EF, REMOVE_TOPIC_PF}, groupId = GROUP_ID)
    public void consumeRemoveAccountSF(String message) throws JsonProcessingException, AccountNotFoundException {
        accountService.removeAccount(message);
    }
}
