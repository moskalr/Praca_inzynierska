package pl.lodz.p.it.socialfridgemicroservice.service;

import jakarta.annotation.security.PermitAll;
import org.springframework.security.access.prepost.PreAuthorize;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.productException.DeletedProductModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.productException.ProductNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.model.ProductModel;
import jakarta.mail.MessagingException;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    @PermitAll
    List<ProductModel> getAllProducts(Category category, String title, Pageable pageable);

    @PermitAll
    ProductModel getProduct(Long id) throws ProductNotFoundException;

    @PreAuthorize("hasRole(@Roles.USER) or hasRole(@Roles.MANAGER)")
    List<ProductModel> addProduct(ProductModel addProduct) throws InvalidDistanceFromSocialFridgeException, SocialFridgeNotFoundException, InactiveSocialFridgeException, DeletedSocialFridgeModificationException, MessagingException;

    @PreAuthorize("hasRole(@Roles.USER) or hasRole(@Roles.MANAGER)")
    ProductModel archiveProduct(Long id, String latitude, String longitude) throws ProductNotFoundException, DeletedProductModificationException, InvalidDistanceFromSocialFridgeException, OutdatedDataException;
}
