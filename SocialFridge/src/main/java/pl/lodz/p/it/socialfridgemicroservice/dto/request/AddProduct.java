package pl.lodz.p.it.socialfridgemicroservice.dto.request;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductUnit;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddProduct {

    @NotNull
    private Long socialFridgeId;

    @NotNull
    @Future
    private LocalDateTime expirationDate;

    @NotBlank
    private String title;

    @Size(min = 10, max = 2000)
    private String description;

    @NotNull
    @Setter(AccessLevel.NONE)
    private Set<Category> categories = new HashSet<>();

    @NotNull
    private ProductUnit productUnit;

    @NotNull
    private Double size;

    private String image;

    private String latitude;

    private String longitude;

    @Min(value = 1)
    private int pieces;
}

