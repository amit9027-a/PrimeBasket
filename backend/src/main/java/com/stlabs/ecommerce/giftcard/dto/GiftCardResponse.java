
package com.stlabs.ecommerce.giftcard.dto;

import com.stlabs.ecommerce.giftcard.entity.GiftCard;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record GiftCardResponse(
    Long id,
    String code,
    BigDecimal initialAmount,
    BigDecimal balance,
    boolean active,
    LocalDate expiryDate,
    LocalDateTime createdAt
) {
    public static GiftCardResponse from(GiftCard card) {
        return new GiftCardResponse(
            card.getId(),
            card.getCode(),
            card.getInitialAmount(),
            card.getBalance(),
            card.isActive(),
            card.getExpiryDate(),
            card.getCreatedAt()
        );
    }
}
