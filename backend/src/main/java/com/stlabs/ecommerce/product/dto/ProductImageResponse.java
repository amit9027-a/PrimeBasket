package com.stlabs.ecommerce.product.dto;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        boolean primaryImage
) {
}
