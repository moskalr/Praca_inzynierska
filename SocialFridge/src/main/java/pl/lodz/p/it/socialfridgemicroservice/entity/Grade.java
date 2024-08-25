package pl.lodz.p.it.socialfridgemicroservice.entity;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
public class Grade extends AbstractEntity {
    @Min(0)
    @Max(5)
    @Setter
    @Column(nullable = false)
    private Float rating;
}