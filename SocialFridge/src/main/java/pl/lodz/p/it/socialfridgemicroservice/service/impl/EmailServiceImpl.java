package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.model.ProductModel;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl {
    private final MessageSource messageSource;
    private final JavaMailSender javaMailSender;
    private static final String EXPIRATION_TITLE_KEY = "mail.product.expiration.title";
    private static final String EXPIRATION_MESSAGE_KEY = "mail.product.expiration.message";
    private static final String NEW_PRODUCT_TITLE_KEY = "mail.new.product.title";
    private static final String NEW_PRODUCT_FRIDGE_MESSAGE_KEY = "mail.new.product.fridge.message";
    private static final String NEW_PRODUCT_CATEGORY_MESSAGE_KEY = "mail.new.product.category.message";
    private static final String UPDATE_FRIDGE_TITLE_KEY = "mail.fridge.update.title";
    private static final String UPDATE_FRIDGE_MESSAGE_KEY = "mail.fridge.update.message";
    private static final String UTF = "utf-8";
    private static final String NEW_LINE = ",<br>";
    private static final String PRODUCT_FORMAT = "%d, %s";

    private static final String ADD_ELITE_USER_TITLE_KEY = "mail.add.elite.user.title";
    private static final String ADD_ELITE_USER_MESSAGE_KEY = "mail.add.elite.user.message";
    private static final String REMOVE_ELITE_USER_TITLE_KEY = "mail.remove.elite.user.title";
    private static final String REMOVE_ELITE_USER_MESSAGE_KEY = "mail.remove.elite.user.message";

    @Value("${SENDER_EMAIL}")
    private String senderEmail;


    public void sendEmail(String to, String messageBody, String subject) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper mailMessage = new MimeMessageHelper(message, true, UTF);
        mailMessage.setFrom(senderEmail);
        mailMessage.setTo(to);
        mailMessage.setText(messageBody);
        mailMessage.setSubject(subject);
        javaMailSender.send(message);
    }

    public void sendEmailWithImage(String to, String messageBody, String subject, String imageUrl) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper mailMessage = new MimeMessageHelper(message, true, UTF);
        mailMessage.setFrom(senderEmail);
        mailMessage.setTo(to);
        mailMessage.setText(messageBody, true);
        mailMessage.setSubject(subject);
        String imgHtml = "<img src='" + imageUrl + "' alt='Image' style='max-width:100%;'>";
        mailMessage.setText(messageBody + "<br>" + imgHtml, true);

        javaMailSender.send(message);
    }

    @Retryable(value = MailException.class, maxAttemptsExpression = "${retry.email.max-attempts}",
            backoff =
            @Backoff(delayExpression = "${retry.email.delay.ms}",
                    multiplierExpression = "${retry.email.multiplier}"))
    public void sendExpirationNotificationToManager(String email, String title, Long id, String buildingNumber, String street, String city, Language language) throws MessagingException {
        String subject = messageSource.getMessage(EXPIRATION_TITLE_KEY, null, Locale.forLanguageTag(language.toString()));

        String messageTemplate = messageSource.getMessage(EXPIRATION_MESSAGE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageBody = String.format(messageTemplate, buildingNumber, street, city, title, id);

        sendEmail(email, messageBody, subject);
    }

    @Retryable(value = MailException.class, maxAttemptsExpression = "${retry.email.max-attempts}",
            backoff =
            @Backoff(delayExpression = "${retry.email.delay.ms}",
                    multiplierExpression = "${retry.email.multiplier}"))
    public void sendNotificationToUsersFollowingFridge(String email, Long fridgeId, Language language) throws MessagingException {
        String subject = messageSource.getMessage(NEW_PRODUCT_TITLE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageTemplate = messageSource.getMessage(NEW_PRODUCT_FRIDGE_MESSAGE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageBody = String.format(messageTemplate, fridgeId);
        sendEmail(email, messageBody, subject);
    }

    @Retryable(value = MailException.class, maxAttemptsExpression = "${retry.email.max-attempts}",
            backoff =
            @Backoff(delayExpression = "${retry.email.delay.ms}",
                    multiplierExpression = "${retry.email.multiplier}"))
    public void sendNotificationToUsersFollowingCategory(String email, Long fridgeId, Language language) throws MessagingException {
        String subject = messageSource.getMessage(NEW_PRODUCT_TITLE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageTemplate = messageSource.getMessage(NEW_PRODUCT_CATEGORY_MESSAGE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageBody = String.format(messageTemplate, fridgeId);
        sendEmail(email, messageBody, subject);
    }

    @Retryable(value = MailException.class, maxAttemptsExpression = "${retry.email.max-attempts}",
            backoff =
            @Backoff(delayExpression = "${retry.email.delay.ms}",
                    multiplierExpression = "${retry.email.multiplier}"))
    public void sendUpdateNotificationToManager(String email, Long fridgeId, String buildingNumber, String street, String city, List<ProductModel> products, String image, String description, Language language) throws MessagingException {
        String subject = messageSource.getMessage(UPDATE_FRIDGE_TITLE_KEY, null, Locale.forLanguageTag(language.toString()));

        String messageTemplate = messageSource.getMessage(UPDATE_FRIDGE_MESSAGE_KEY, null, Locale.forLanguageTag(language.toString()));
        String productList = products.stream()
                .map(product -> String.format(PRODUCT_FORMAT, product.getId(), product.getTitle()))
                .collect(Collectors.joining(NEW_LINE));

        String messageBody = String.format(messageTemplate, fridgeId, buildingNumber, street, city, productList, description);

        sendEmailWithImage(email, messageBody, subject, image);
    }

    @Retryable(value = MailException.class, maxAttemptsExpression = "${retry.email.max-attempts}",
            backoff =
            @Backoff(delayExpression = "${retry.email.delay.ms}",
                    multiplierExpression = "${retry.email.multiplier}"))
    public void addEliteUserAccessLevel(String firstName, String lastName, String email, Language language) throws MessagingException {
        String subject = messageSource.getMessage(ADD_ELITE_USER_TITLE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageTemplate = messageSource.getMessage(ADD_ELITE_USER_MESSAGE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageBody = String.format(messageTemplate, firstName, lastName);
        sendEmail(email, messageBody, subject);
    }

    @Retryable(value = MailException.class, maxAttemptsExpression = "${retry.email.max-attempts}",
            backoff =
            @Backoff(delayExpression = "${retry.email.delay.ms}",
                    multiplierExpression = "${retry.email.multiplier}"))
    public void removeEliteUserAccessLevel(String firstName, String lastName, String email, Language language) throws MessagingException {
        String subject = messageSource.getMessage(REMOVE_ELITE_USER_TITLE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageTemplate = messageSource.getMessage(REMOVE_ELITE_USER_MESSAGE_KEY, null, Locale.forLanguageTag(language.toString()));
        String messageBody = String.format(messageTemplate, firstName, lastName);
        sendEmail(email, messageBody, subject);
    }
}
