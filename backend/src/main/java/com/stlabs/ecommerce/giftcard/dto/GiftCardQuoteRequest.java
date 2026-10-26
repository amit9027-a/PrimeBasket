
package com.stlabs.ecommerce.giftcard.dto;

import jakarta.validation.constraints.NotBlank;

public record GiftCardQuoteRequest(
        @NotBlank(message = "Gift Card code is required")
        String code
) {}
