package pl.lodz.p.it.socialfridgemicroservice.model;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountModel {
    private Long id;

    private String username;

    private String firstName;

    private String lastName;

    private String email;

    private Boolean isEnabled;

    private Language language;

    @Setter(AccessLevel.NONE)
    private List<SocialFridgeModel> favSocialFridges = new ArrayList<>();

    @Setter(AccessLevel.NONE)
    private Set<Category> favCategories = new HashSet<>();

    @Setter(AccessLevel.NONE)
    private List<String> roles = new ArrayList<>();

    @Setter(AccessLevel.NONE)
    private List<Long> favSocialFridgesId = new ArrayList<>();

    private String eTag;
}
