
package com.stlabs.ecommerce.giftcard.dto;

import java.math.BigDecimal;

public record GiftCardQuoteResponse(
        String code,
        BigDecimal cartTotal,
        BigDecimal availableBalance,
        BigDecimal discount,
        BigDecimal payableAmount
) {}
