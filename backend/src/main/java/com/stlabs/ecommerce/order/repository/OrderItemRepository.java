package com.stlabs.ecommerce.order.repository;

import com.stlabs.ecommerce.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
