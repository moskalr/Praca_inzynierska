package pl.lodz.p.it.socialfridgemicroservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GradeModel {
    private Float rating = 0F;

    private String eTag;
}
