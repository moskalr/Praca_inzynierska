package pl.lodz.p.it.socialfridgemicroservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;

import java.util.*;

@Getter
@Entity
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Account extends AbstractEntity {
    private static final String EMAIL_PATTERN = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    @Size(min = 6, max = 16)
    @Column(nullable = false)
    private String username;

    @Size(max = 32)
    @Column(nullable = false, name = "first_name")
    private String firstName;

    @Size(max = 32)
    @Column(nullable = false, name = "last_name")
    private String lastName;

    @Size(max = 255)
    @Pattern(regexp = EMAIL_PATTERN)
    @Column(nullable = false, unique = true)
    private String email;

    @Setter
    @Column(nullable = false, name = "is_enabled")
    private Boolean isEnabled;

    @Setter
    @Column(nullable = false, name = "update_counter")
    private Integer updateCounter;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "account_fav_social_fridges",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "fav_social_fridges_id")
    )
    @Setter(AccessLevel.NONE)
    private List<SocialFridge> favSocialFridges = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "account_fav_categories",
            joinColumns = @JoinColumn(name = "account_id")
    )
    @Column(name = "fav_categories", nullable = false)
    private Set<Category> favCategories = new HashSet<>();
    TreeMap
    HashSet
    HashMap
    HashSet

    @Setter(AccessLevel.NONE)
    @Column(nullable = false)
    private List<String> roles = new ArrayList<>();
}