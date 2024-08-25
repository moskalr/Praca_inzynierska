package pl.lodz.p.it.socialfridgemicroservice.model;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductUnit;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductModel {
    private Long id;

    private LocalDateTime expirationDate;

    private String title;

    private String description;

    private ProductUnit productUnit;

    private Double size;

    private String image;

    private SocialFridgeModel socialFridge;

    private String latitude;

    private String longitude;

    private Long socialFridgeId;

    private ProductState state;

    @Setter(AccessLevel.NONE)
    private Set<Category> categories = new HashSet<>();

    private int pieces;

    private String eTag;
}
