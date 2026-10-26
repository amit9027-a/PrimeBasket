
package com.stlabs.ecommerce.wishlist.controller;

import com.stlabs.ecommerce.wishlist.dto.WishlistItemResponse;
import com.stlabs.ecommerce.wishlist.entity.WishlistItem;
import com.stlabs.ecommerce.wishlist.service.WishlistService;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public List<WishlistItemResponse> getWishlist() {
        return wishlistService.getWishlist()
                .stream()
                .map(WishlistItemResponse::from)
                .toList();
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void addProduct(@PathVariable Long productId) {
        wishlistService.addProduct(productId);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeProduct(@PathVariable Long productId) {
        wishlistService.removeProduct(productId);
    }
}