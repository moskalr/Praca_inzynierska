package pl.lodz.p.it.socialfridgemicroservice.entity;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductUnit;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
public class Product extends AbstractEntity {
    @Future
    @NotNull
    @Column(nullable = false, updatable = false, name = "expiration_date")
    private LocalDateTime expirationDate;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Size(min = 10, max = 2000)
    @Column(nullable = false)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "product_unit")
    private ProductUnit productUnit;

    @NotNull
    @Column(nullable = false)
    private Double size;

    private String image;

    @ManyToOne
    @JoinColumn(name = "social_fridge_id", nullable = false, updatable = false)
    private SocialFridge socialFridge;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Set<Category> categories = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private ProductState state = ProductState.AVAILABLE;
}