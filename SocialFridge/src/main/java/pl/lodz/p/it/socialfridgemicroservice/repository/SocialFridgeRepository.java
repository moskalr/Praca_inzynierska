package pl.lodz.p.it.socialfridgemicroservice.repository;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
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
public interface SocialFridgeRepository extends JpaRepository<SocialFridge, Long> {
    List<SocialFridge> findByState(SocialFridgeState state);

    @Query("SELECT s FROM SocialFridge s WHERE s.state IN :states")
    List<SocialFridge> findByStates(List<SocialFridgeState> states);

    @Query("SELECT s FROM SocialFridge s WHERE (s.account.id = :accountId) AND (s.state IN :states)")
    List<SocialFridge> findManagedSocialFridges(List<SocialFridgeState> states, Long accountId, Pageable pageable);

    @Query("SELECT DISTINCT s FROM SocialFridge s LEFT JOIN FETCH s.products p WHERE s.id = :id AND (p IS NULL OR p.state = 'AVAILABLE')")
    SocialFridge findByIdWithAvailableProducts(@Param("id") Long id);
}