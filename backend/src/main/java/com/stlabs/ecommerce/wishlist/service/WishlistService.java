
package com.stlabs.ecommerce.wishlist.service;

import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.user.entity.User;
import com.stlabs.ecommerce.wishlist.entity.WishlistItem;
import com.stlabs.ecommerce.wishlist.repository.WishlistRepository;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<WishlistItem> getWishlist() {
        User user = currentUserService.getCurrentUser();

        return wishlistRepository
                .findAllByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public void addProduct(Long productId) {
        User user = currentUserService.getCurrentUser();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        boolean alreadySaved = wishlistRepository
                .existsByUser_IdAndProduct_Id(user.getId(), productId);

        if (!alreadySaved) {
            wishlistRepository.save(new WishlistItem(user, product));
        }
    }

    @Transactional
    public void removeProduct(Long productId) {
        User user = currentUserService.getCurrentUser();

        boolean exists = wishlistRepository
                .existsByUser_IdAndProduct_Id(user.getId(), productId);

        if (!exists) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found in wishlist"
            );
        }

        wishlistRepository.deleteByUser_IdAndProduct_Id(
                user.getId(),
                productId
        );
    }
}