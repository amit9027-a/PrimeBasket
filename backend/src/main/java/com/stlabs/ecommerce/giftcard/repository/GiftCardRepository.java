
package com.stlabs.ecommerce.giftcard.repository;

import com.stlabs.ecommerce.giftcard.entity.GiftCard;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GiftCardRepository extends JpaRepository<GiftCard, Long> {

    Optional<GiftCard> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    List<GiftCard> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GiftCard g where upper(g.code) = upper(:code)")
    Optional<GiftCard> findByCodeForUpdate(@Param("code") String code);
}
