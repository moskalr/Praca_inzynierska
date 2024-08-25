package pl.lodz.p.it.socialfridgemicroservice.entity;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
public class Suggestion extends AbstractEntity {
    @ManyToOne
    @JoinColumn(nullable = false, updatable = false, name = "social_fridge_id")
    private SocialFridge socialFridge;

    @Size(min = 10, max = 2000)
    @Column(nullable = false)
    private String description;

    @Column(nullable = false, name = "is_new")
    private Boolean isNew;

    private String image;
}