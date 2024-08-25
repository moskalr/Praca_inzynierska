package pl.lodz.p.it.socialfridgemicroservice.utils.eTag.impl;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.EntityTag;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ETagCalculatorImpl implements ETagCalculator {
    private final HttpServletRequest httpServletRequest;
    @Override
    public EntityTag calculateETagForEntity(AbstractEntity entity) {
        String entityValuesToHash = getEntityValuesToHash(entity);
        String hash = calculateHash(entityValuesToHash);
        return new EntityTag(hash);
    }

    @Override
    public boolean verifyProvidedETag(AbstractEntity entity) {
        String calculatedETag = calculateETagForEntity(entity).getValue();
        String eTagFromHeader = httpServletRequest.getHeader(HttpHeaders.IF_MATCH);
        return calculatedETag.equals(eTagFromHeader);
    }

    private String getEntityValuesToHash(AbstractEntity entity) {
        return entity.getId() + "-" + entity.getVersion();
    }

    private String calculateHash(String input) {
        return DigestUtils.sha256Hex(input);
    }
}

