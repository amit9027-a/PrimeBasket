package com.stlabs.ecommerce.cart.controller;

import com.stlabs.ecommerce.cart.dto.CartItemRequest;
import com.stlabs.ecommerce.cart.dto.CartResponse;
import com.stlabs.ecommerce.cart.dto.UpdateCartItemRequest;
import com.stlabs.ecommerce.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Authenticated shopping cart endpoints")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public CartResponse getCurrentCart() {
        return cartService.getCurrentCart();
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to cart")
    public CartResponse addItem(@Valid @RequestBody CartItemRequest request) {
        return cartService.addItem(request);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public CartResponse updateItem(@PathVariable Long itemId, @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from cart")
    public CartResponse removeItem(@PathVariable Long itemId) {
        return cartService.removeItem(itemId);
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear current user's cart")
    public CartResponse clearCart() {
        return cartService.clearCart();
    }
}
