package com.stlabs.ecommerce.product.entity;

import com.stlabs.ecommerce.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage extends BaseEntity {
    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false, unique = true)
    private String publicId;

    @Column(nullable = false)
    private boolean primaryImage;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
