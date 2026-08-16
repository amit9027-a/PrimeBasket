package com.stlabs.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateOrderRequest(
        @NotBlank(message = "Shipping address is required")
        String shippingAddress
) {
}
