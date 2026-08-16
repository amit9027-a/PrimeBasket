package com.stlabs.ecommerce.order.dto;

import com.stlabs.ecommerce.order.entity.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        Long userId,
        String customerEmail,
        Double totalAmount,
        String shippingAddress,
        OrderStatus status,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}
