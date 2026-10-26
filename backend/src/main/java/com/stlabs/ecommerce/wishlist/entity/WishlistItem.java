
package com.stlabs.ecommerce.wishlist.entity;

import com.stlabs.ecommerce.common.entity.BaseEntity;
import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.user.entity.User;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "wishlist_items",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_wishlist_user_product",
            columnNames = {"user_id", "product_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class WishlistItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public WishlistItem(User user, Product product) {
        this.user = user;
        this.product = product;
    }
}