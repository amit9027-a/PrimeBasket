package com.stlabs.ecommerce.product.repository;

import com.stlabs.ecommerce.product.entity.ProductImage;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    Optional<ProductImage> findByIdAndProductId(Long id, Long productId);
}
