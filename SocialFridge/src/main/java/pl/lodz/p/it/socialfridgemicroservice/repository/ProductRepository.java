package pl.lodz.p.it.socialfridgemicroservice.repository;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

import java.util.List;

@Repository
@Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        rollbackFor = AppBaseException.class,
        transactionManager = "fridgeTransactionManager"
)
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByState(ProductState state);

    @Query("SELECT p FROM Product p WHERE (:category IS NULL OR :category MEMBER OF p.categories) AND (:title IS NULL OR p.title LIKE %:title% OR p.title = :title) AND (p.state = :state)")
    List<Product> findAllProducts(@Param("state") ProductState state, @Param("category") Category category, @Param("title") String title, Pageable pageable);

    List<Product> findAllByIdIn(List<Long> productIds);
}

