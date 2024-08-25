package pl.lodz.p.it.socialfridgemicroservice.utils.eTag;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import jakarta.ws.rs.core.EntityTag;

public interface ETagCalculator {
    EntityTag calculateETagForEntity(AbstractEntity entity);
    boolean verifyProvidedETag(AbstractEntity entity);
}
