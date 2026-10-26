
package com.stlabs.ecommerce.wishlist.repository;

import com.stlabs.ecommerce.wishlist.entity.WishlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository
        extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = {"product"})
    List<WishlistItem> findAllByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<WishlistItem> findByUser_IdAndProduct_Id(
            Long userId,
            Long productId
    );

    boolean existsByUser_IdAndProduct_Id(
            Long userId,
            Long productId
    );

    void deleteByUser_IdAndProduct_Id(
            Long userId,
            Long productId
    );
}
