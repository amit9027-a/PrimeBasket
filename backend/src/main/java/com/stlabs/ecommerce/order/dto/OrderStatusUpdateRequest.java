package com.stlabs.ecommerce.order.dto;

import com.stlabs.ecommerce.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "Order status is required")
        OrderStatus status
) {
}
