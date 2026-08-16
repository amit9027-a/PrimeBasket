package com.stlabs.ecommerce.order.controller;

import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.dto.OrderStatusUpdateRequest;
import com.stlabs.ecommerce.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Checkout and order management endpoints")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Place an order from the current cart")
    public OrderResponse placeOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.placeOrder(request);
    }

    @GetMapping
    @Operation(summary = "List orders for the current user or all orders for admin")
    public List<OrderResponse> getOrders() {
        return orderService.getOrders();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by id")
    public OrderResponse getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Admin only")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order")
    public OrderResponse cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }
}
