package com.stlabs.ecommerce.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stlabs.ecommerce.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCategoryId(Long categoryId);
}
