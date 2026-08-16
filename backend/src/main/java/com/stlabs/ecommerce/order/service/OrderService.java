package com.stlabs.ecommerce.order.service;

import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.dto.OrderStatusUpdateRequest;
import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(CreateOrderRequest request);

    OrderResponse placePaidOrder(
            CreateOrderRequest request,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    );

    List<OrderResponse> getOrders();

    OrderResponse getOrderById(Long id);

    OrderResponse updateStatus(
            Long id,
            OrderStatusUpdateRequest request
    );

    OrderResponse cancelOrder(Long id);
}