package pl.lodz.p.it.socialfridgemicroservice.repository;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
@Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        rollbackFor = AppBaseException.class,
        transactionManager = "fridgeTransactionManager"
)
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUsername(String username);

    @Query("SELECT DISTINCT a FROM Account a " +
            "JOIN a.favCategories fc " +
            "WHERE fc IN :productCategories " +
            "AND a.username != :username")
    List<Account> findByFavCategoriesContainingProductCategoriesAndDifferentUsername(
            @Param("productCategories") Set<Category> productCategories,
            @Param("username") String username);

    @Query("SELECT DISTINCT a FROM Account a " +
            "JOIN a.favSocialFridges fsf " +
            "WHERE fsf = :socialFridge " +
            "AND a.username != :username")
    List<Account> findByFavSocialFridgesContainsAndDifferentUsername(
            @Param("socialFridge") SocialFridge socialFridge,
            @Param("username") String username);
}
