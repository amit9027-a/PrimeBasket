package com.stlabs.ecommerce.giftcard.dto;

import com.stlabs.ecommerce.giftcard.entity.GiftCardRedemption;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GiftCardRedemptionResponse(
    Long id,
    String giftCardCode,
    BigDecimal amount,
    Long orderId,
    LocalDateTime redeemedAt
) {
    public static GiftCardRedemptionResponse from(
            GiftCardRedemption redemption) {

        return new GiftCardRedemptionResponse(
            redemption.getId(),
            redemption.getGiftCard().getCode(),
            redemption.getAmount(),
            redemption.getOrder() == null
                ? null
                : redemption.getOrder().getId(),
            redemption.getCreatedAt()
        );
    }
}