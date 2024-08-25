package pl.lodz.p.it.socialfridgemicroservice.endpoints;

import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddProduct;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.DeleteProduct;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.ProductInfo;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.ProductListInfo;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import jakarta.annotation.security.PermitAll;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/products")
public interface ProductEndpoint {

    @GetMapping
    @PermitAll
    ResponseEntity<List<ProductListInfo>> getAllProducts(@RequestParam(required = false) Category category,
                                                         @RequestParam(required = false) String title,
                                                         Pageable pageable);

    @GetMapping("/{id}")
    @PermitAll
    ResponseEntity<ProductInfo> getProduct(@PathVariable("id") Long id);

    @PostMapping
    @PreAuthorize("hasRole(@Roles.USER) or hasRole(@Roles.MANAGER)")
    ResponseEntity<List<ProductInfo>> addProduct(@Validated @RequestBody AddProduct addProduct);

    @PutMapping
    @PreAuthorize("hasRole(@Roles.USER) or hasRole(@Roles.MANAGER)")
    ResponseEntity<ProductInfo> archiveProduct(@Validated @RequestBody DeleteProduct deleteProduct);
}
