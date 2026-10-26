
package com.stlabs.ecommerce.giftcard.repository;

import com.stlabs.ecommerce.giftcard.entity.GiftCardRedemption;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GiftCardRedemptionRepository
        extends JpaRepository<GiftCardRedemption, Long> {

    List<GiftCardRedemption>
        findByGiftCardIdOrderByCreatedAtDesc(Long giftCardId);

    List<GiftCardRedemption>
        findByUserIdOrderByCreatedAtDesc(Long userId);
}
