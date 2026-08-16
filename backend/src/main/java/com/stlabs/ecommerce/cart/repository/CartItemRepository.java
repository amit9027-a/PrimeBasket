package com.stlabs.ecommerce.cart.repository;

import com.stlabs.ecommerce.cart.entity.CartItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    Optional<CartItem> findByIdAndCartId(Long id, Long cartId);

    void deleteByCartId(Long cartId);
}
