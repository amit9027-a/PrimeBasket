
package com.stlabs.ecommerce.giftcard.dto;

import jakarta.validation.constraints.NotNull;

public record GiftCardStatusRequest(
    @NotNull(message = "Active status is required")
    Boolean active
) {}
