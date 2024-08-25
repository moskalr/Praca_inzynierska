package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductListInfo {
    private Long id;

    private String title;

    private ProductState state;

    private String image;

    private Set<Category> categories = new HashSet<>();
}
