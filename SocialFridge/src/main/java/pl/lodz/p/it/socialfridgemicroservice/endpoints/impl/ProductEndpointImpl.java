package pl.lodz.p.it.socialfridgemicroservice.endpoints.impl;

import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddProduct;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.DeleteProduct;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.ProductInfo;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.ProductListInfo;
import pl.lodz.p.it.socialfridgemicroservice.endpoints.ProductEndpoint;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.exception.CustomResponseStatusException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.productException.DeletedProductModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.productException.ProductNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.ProductListMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.ProductMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.ProductModel;
import pl.lodz.p.it.socialfridgemicroservice.service.ProductService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductEndpointImpl implements ProductEndpoint {
    private final ProductService productService;
    private final ProductMapper productMapper;
    private final ProductListMapper productListMapper;

    @Override
    public ResponseEntity<List<ProductListInfo>> getAllProducts(Category category, String title, Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(category, title, pageable)
                .stream()
                .map(productListMapper::productToProductListInfo)
                .toList());
    }

    @Override
    public ResponseEntity<ProductInfo> getProduct(Long id) {
        try {
            final ProductModel productModel = productService.getProduct(id);
            return ResponseEntity.status(HttpStatus.OK).eTag(productModel.getETag()).body(productMapper.productToProductInfo(productModel));
        } catch (ProductNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<List<ProductInfo>> addProduct(AddProduct addProduct) {
        try {
            List<ProductModel> productsModel = productService.addProduct(productMapper.addProductToProductModel(addProduct));
            return ResponseEntity.ok(productsModel
                    .stream()
                    .map(productMapper::productToProductInfo)
                    .toList());
        } catch (InvalidDistanceFromSocialFridgeException | DeletedSocialFridgeModificationException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        } catch (SocialFridgeNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (InactiveSocialFridgeException e) {
            throw new CustomResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e.getKey());
        } catch (MessagingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<ProductInfo> archiveProduct(DeleteProduct deleteProduct) {
        try {
            ProductModel productModel = productService.archiveProduct(deleteProduct.getId(), deleteProduct.getLatitude(), deleteProduct.getLongitude());
            return ResponseEntity.ok(productMapper.productToProductInfo(productModel));
        } catch (InvalidDistanceFromSocialFridgeException | DeletedProductModificationException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        } catch (ProductNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (OutdatedDataException e) {
            throw new CustomResponseStatusException(HttpStatus.PRECONDITION_FAILED, e.getMessage(), e.getKey());
        }
    }
}
