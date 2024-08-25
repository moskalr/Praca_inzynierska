package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductUnit;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductInfo {
    private Long id;

    private LocalDateTime expirationDate;

    private String title;

    private String description;

    private String image;

    private ProductUnit productUnit;

    private Double size;

    private ProductState state;

    private SocialFridgeInfo socialFridge;

    private Set<Category> categories = new HashSet<>();
}
