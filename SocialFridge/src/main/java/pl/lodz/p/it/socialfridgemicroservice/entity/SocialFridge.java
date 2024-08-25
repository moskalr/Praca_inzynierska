package pl.lodz.p.it.socialfridgemicroservice.entity;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "social_fridge")
public class SocialFridge extends AbstractEntity {
    @OneToMany(mappedBy = "socialFridge", fetch = FetchType.EAGER)
    @Setter(AccessLevel.NONE)
    @Column(nullable = false)
    private List<Product> products = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(updatable = false, nullable = false)
    private Address address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SocialFridgeState state = SocialFridgeState.ACTIVE;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Account account;

    @OneToOne
    @JoinColumn(nullable = false, name = "social_fridge_average_rating_id")
    private SocialFridgeAverageRating socialFridgeAverageRating;

    @OneToMany(fetch = FetchType.EAGER)
    @Setter(AccessLevel.NONE)
    @Column(nullable = false)
    @JoinTable(
            name = "social_fridge_grades",
            joinColumns = @JoinColumn(name = "social_fridge_id"),
            inverseJoinColumns = @JoinColumn(name = "grades_id")
    )
    private List<Grade> grades = new ArrayList<>();
}