
package com.stlabs.ecommerce.giftcard.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGiftCardRequest(
    @NotNull(message = "Gift Card amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least 1")
    @Digits(integer = 10, fraction = 2, message = "Invalid amount")
    BigDecimal amount,

    @FutureOrPresent(message = "Expiry date must be today or in the future")
    LocalDate expiryDate
) {}
