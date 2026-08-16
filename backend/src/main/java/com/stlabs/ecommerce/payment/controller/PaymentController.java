package com.stlabs.ecommerce.payment.controller;

import com.razorpay.Order;
import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.service.OrderService;
import com.stlabs.ecommerce.order.service.RazorpayPaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayPaymentService razorpayPaymentService;
    private final OrderService orderService;

   @PostMapping("/create-order")
public ResponseEntity<?> createOrder(@RequestParam double amount) {

    try {
        Order order = razorpayPaymentService.createOrder(amount);

        JSONObject response = new JSONObject();

        response.put("orderId", (Object) order.get("id"));
        response.put("amount", (Object) order.get("amount"));
        response.put("currency", (Object) order.get("currency"));

        return ResponseEntity.ok(response.toMap());

    } catch (Exception e) {
        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body("Payment order creation failed: " + e.getMessage());
    }
}

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request
    ) {

        try {

            CreateOrderRequest createOrderRequest =
                    new CreateOrderRequest(
                            request.shippingAddress()
                    );

            OrderResponse orderResponse =
                    orderService.placePaidOrder(
                            createOrderRequest,
                            request.razorpayOrderId(),
                            request.razorpayPaymentId(),
                            request.razorpaySignature()
                    );

            return ResponseEntity.ok(
                    orderResponse
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Payment verification failed: "
                                    + e.getMessage()
                    );
        }
    }

    
    public record PaymentVerificationRequest(
            String shippingAddress,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {
    }
}