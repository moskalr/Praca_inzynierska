package pl.lodz.p.it.accountmicroservice.config;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component("Roles")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Roles {
    public static final String GUEST = "CLIENT_GUEST";
    public static final String USER = "CLIENT_USER";
    public static final String ADMIN = "CLIENT_ADMIN";
    public static final String MANAGER = "CLIENT_MANAGER";
    public static final String MODERATOR = "CLIENT_MODERATOR";
    public static final String VOLUNTEER = "CLIENT_VOLUNTEER";
}