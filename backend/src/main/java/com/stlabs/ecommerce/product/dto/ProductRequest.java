package com.stlabs.ecommerce.product.dto;

import jakarta.validation.constraints.*;

public record ProductRequest(

        @NotBlank(message = "Product name is required")
        String name,
        
        String description,

        @NotNull(message = "Price is required")
        @Positive(message = "Price must be greater than zero")
        Double price,

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock cannot be negative")
        Integer stockQuantity,

        @NotNull(message = "Category id is required")
        Long categoryId) {
}
