package com.stlabs.ecommerce.cart.dto;

import java.util.List;

public record CartResponse(
        Long id,
        Long userId,
        Integer totalItems,
        Double totalAmount,
        List<CartItemResponse> items
) {
}
