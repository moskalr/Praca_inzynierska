package pl.lodz.p.it.socialfridgemicroservice.repository;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

import java.util.Optional;

@Repository
@Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        rollbackFor = AppBaseException.class,
        transactionManager = "fridgeTransactionManager"
)
public interface AddressRepository extends JpaRepository<Address, Long> {
    Optional<Address> findByLatitudeAndLongitude(String latitude, String longitude);
}
