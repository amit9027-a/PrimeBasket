package com.stlabs.ecommerce.order.service;

import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.dto.OrderStatusUpdateRequest;
import java.util.List;

public interface OrderService {

    double getCurrentCartTotal();

    double getCheckoutTotal(String giftCardCode);

    OrderResponse placeOrder(CreateOrderRequest request);

    OrderResponse placeOrder(
            CreateOrderRequest request,
            String giftCardCode);

    OrderResponse placePaidOrder(
            CreateOrderRequest request,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String paymentMethod);

    OrderResponse placePaidOrder(
            CreateOrderRequest request,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String paymentMethod,
            String giftCardCode);

    List<OrderResponse> getOrders();

    OrderResponse getOrderById(Long id);

    OrderResponse updateStatus(
            Long id,
            OrderStatusUpdateRequest request);

    OrderResponse cancelOrder(Long id);
}