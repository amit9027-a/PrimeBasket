package com.stlabs.ecommerce.product.dto;

import java.util.List;

public record ProductResponse(

        Long id,

        String name,

        String description,

        Double price,

        Integer stockQuantity,

        Long categoryId,

        String categoryName,

        List<ProductImageResponse> images
) {
}
