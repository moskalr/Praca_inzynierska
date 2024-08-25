package pl.lodz.p.it.socialfridgemicroservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter;
    private static final String RESOURCE_ACCESS_CLAIM = "resource_access";
    private static final String RESOURCE_ID_CLAIM = "roles";
    private static final String ROLE_PREFIX = "ROLE_";

    @Value("${jwt.auth.converter.principle-attribute}")
    private String principleAttribute;
    @Value("${jwt.auth.converter.resource-id}")
    private String resourceId;

    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {
        final Collection<GrantedAuthority> authorities = new HashSet<>();

        final Collection<GrantedAuthority> jwtAuthorities = jwtGrantedAuthoritiesConverter
                .convert(jwt);
        authorities.addAll(jwtAuthorities);

        authorities.addAll(extractResourceRoles(jwt));

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                getPrincipleClaimName(jwt)
        );
    }

    private String getPrincipleClaimName(Jwt jwt) {
        String claimName = JwtClaimNames.SUB;
        if (principleAttribute != null) {
            claimName = principleAttribute;
        }
        return jwt.getClaim(claimName);
    }

    private Collection<String> getResourceRolesFromJwt(Jwt jwt) {
        if (jwt.getClaim(RESOURCE_ACCESS_CLAIM) == null) {
            return Set.of();
        }

        final Map<String, Object> resourceAccess = jwt.getClaim(RESOURCE_ACCESS_CLAIM);
        if (resourceAccess.get(resourceId) == null) {
            return Set.of();
        }

        final Map<String, Object> resource = (Map<String, Object>) resourceAccess.get(resourceId);
        return (Collection<String>) resource.get(RESOURCE_ID_CLAIM);
    }

    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
        final Collection<String> resourceRoles = getResourceRolesFromJwt(jwt);
        return resourceRoles
                .stream()
                .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role))
                .collect(Collectors.toSet());
    }
}