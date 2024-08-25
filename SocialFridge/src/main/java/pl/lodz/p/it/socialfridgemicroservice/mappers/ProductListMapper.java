package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.response.ProductListInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.model.ProductModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductListMapper {
    ProductListInfo productToProductListInfo(ProductModel productModel);

    @Mapping(target = "socialFridge", ignore = true)
    ProductModel productToProductModel(Product product);
}
