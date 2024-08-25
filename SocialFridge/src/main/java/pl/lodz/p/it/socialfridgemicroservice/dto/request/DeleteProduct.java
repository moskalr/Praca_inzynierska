package pl.lodz.p.it.socialfridgemicroservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteProduct {

    @NotNull
    private Long id;

    private String latitude;

    private String longitude;
}
