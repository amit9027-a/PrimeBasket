
package com.stlabs.ecommerce.wishlist.dto;

import com.stlabs.ecommerce.wishlist.entity.WishlistItem;
import java.time.LocalDateTime;

public record WishlistItemResponse(
        Long id,
        Long productId,
        String name,
        String description,
        Double price,
        int stockQuantity,
        LocalDateTime savedAt
) {
    public static WishlistItemResponse from(WishlistItem item) {
        var product = item.getProduct();

        return new WishlistItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                item.getCreatedAt()
        );
    }
}