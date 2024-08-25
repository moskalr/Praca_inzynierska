package pl.lodz.p.it.socialfridgemicroservice.repository;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.entity.Suggestion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

import java.util.List;

@Repository
@Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        rollbackFor = AppBaseException.class,
        transactionManager = "fridgeTransactionManager"
)
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    @Query("SELECT s FROM Suggestion s WHERE s.socialFridge.account.id = :accountId AND s.isNew = :isNew")
    List<Suggestion> findSuggestionsForCurrentUser(@Param("accountId") Long accountId, Pageable pageable, Boolean isNew);
}
