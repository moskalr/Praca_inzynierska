package pl.lodz.p.it.socialfridgemicroservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddProduct;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.ProductInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.model.ProductModel;

@Mapper(componentModel = "spring", uses = FavSocialFridgeListMapper.class)
public interface ProductMapper {
    ProductInfo productToProductInfo(ProductModel productModel);

    @Mapping(target = "socialFridge.products", ignore = true)
    @Mapping(target = "socialFridge.account.favSocialFridges", ignore = true)
    @Mapping(target = "socialFridge.account.favCategories", ignore = true)
    ProductModel productToProductModel(Product product);

    ProductModel addProductToProductModel(AddProduct product);
}
