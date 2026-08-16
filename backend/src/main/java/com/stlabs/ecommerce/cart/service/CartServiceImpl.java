package com.stlabs.ecommerce.cart.service;

import com.stlabs.ecommerce.cart.dto.CartItemRequest;
import com.stlabs.ecommerce.cart.dto.CartItemResponse;
import com.stlabs.ecommerce.cart.dto.CartResponse;
import com.stlabs.ecommerce.cart.dto.UpdateCartItemRequest;
import com.stlabs.ecommerce.cart.entity.Cart;
import com.stlabs.ecommerce.cart.entity.CartItem;
import com.stlabs.ecommerce.cart.repository.CartItemRepository;
import com.stlabs.ecommerce.cart.repository.CartRepository;
import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.exception.ResourceNotFoundException;
import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.product.entity.ProductImage;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import com.stlabs.ecommerce.user.entity.User;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    @Override
    public CartResponse getCurrentCart() {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        return mapToResponse(cart);
    }

    @Override
    public CartResponse addItem(CartItemRequest request) {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        Product product = findProduct(request.productId());
        boolean existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).isPresent();

        CartItem item = existingItem
                ? cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).orElseThrow()
                :
                cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        int updatedQuantity = item.getQuantity() + request.quantity();
        ensureStockAvailable(product, updatedQuantity);
        item.setQuantity(updatedQuantity);
        cartItemRepository.save(item);

        if (!existingItem) {
            cart.getItems().add(item);
        }

        return mapToResponse(cart);
    }

    @Override
    public CartResponse updateItem(Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        CartItem item = findCartItem(cart.getId(), itemId);

        ensureStockAvailable(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);

        return mapToResponse(cart);
    }

    @Override
    public CartResponse removeItem(Long itemId) {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        CartItem item = findCartItem(cart.getId(), itemId);

        cart.getItems().removeIf(existing -> existing.getId().equals(itemId));
        cartItemRepository.delete(item);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse clearCart() {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        return mapToResponse(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setItems(new ArrayList<>());
                    return cartRepository.save(cart);
                });
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private CartItem findCartItem(Long cartId, Long itemId) {
        return cartItemRepository.findByIdAndCartId(itemId, cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
    }

    private void ensureStockAvailable(Product product, int quantity) {
        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems()
                .stream()
                .map(this::mapToItemResponse)
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        double totalAmount = items.stream()
                .mapToDouble(CartItemResponse::subtotal)
                .sum();

        return new CartResponse(
                cart.getId(),
                cart.getUser().getId(),
                totalItems,
                totalAmount,
                items
        );
    }

    private CartItemResponse mapToItemResponse(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getPrice(),
                item.getQuantity(),
                item.getProduct().getPrice() * item.getQuantity(),
                resolvePrimaryImage(item.getProduct())
        );
    }

    private String resolvePrimaryImage(Product product) {
        return product.getImages()
                .stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }
}
