package com.stlabs.ecommerce.cart.service;

import com.stlabs.ecommerce.cart.dto.CartItemRequest;
import com.stlabs.ecommerce.cart.dto.CartResponse;
import com.stlabs.ecommerce.cart.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCurrentCart();

    CartResponse addItem(CartItemRequest request);

    CartResponse updateItem(Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long itemId);

    CartResponse clearCart();
}
