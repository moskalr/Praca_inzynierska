package pl.lodz.p.it.socialfridgemicroservice.entity;

import jakarta.persistence.Table;
import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "social_fridge_average_rating")
public class SocialFridgeAverageRating extends AbstractEntity {
    @Min(0)
    @Max(5)
    @Column(nullable = false, name = "average_rating")
    private Float averageRating = 0f;
}
