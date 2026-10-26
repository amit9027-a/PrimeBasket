package com.stlabs.ecommerce.payment.controller;

import com.razorpay.Order;
import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.service.OrderService;
import com.stlabs.ecommerce.order.service.RazorpayPaymentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final RazorpayPaymentService razorpayPaymentService;
    private final OrderService orderService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody(required = false) CreatePaymentOrderRequest request) {
        try {
            String giftCardCode =
                    request == null ? null : request.giftCardCode();

            // The backend calculates the payable amount.
            // Never trust an amount supplied by the frontend.
            double payableAmount =
                    orderService.getCheckoutTotal(giftCardCode);

            if (!Double.isFinite(payableAmount) || payableAmount <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "The payable amount must be greater than zero. "
                                        + "If your Gift Card covers the full cart, choose COD."
                        ));
            }

            Order razorpayOrder =
                    razorpayPaymentService.createOrder(payableAmount);

            JSONObject response = new JSONObject();
            response.put("orderId", (Object) razorpayOrder.get("id"));
            response.put("amount", (Object) razorpayOrder.get("amount"));
            response.put("currency", (Object) razorpayOrder.get("currency"));

            return ResponseEntity.ok(response.toMap());

        } catch (IllegalArgumentException e) {
            log.warn("Razorpay order validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("Unable to create Razorpay order", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Unable to create payment order"));
        }
    }

    @PostMapping("/cod")
    public ResponseEntity<?> placeCodOrder(
            @Valid @RequestBody CodOrderRequest request) {
        try {
            CreateOrderRequest createOrderRequest =
                    new CreateOrderRequest(request.shippingAddress());

            OrderResponse orderResponse =
                    orderService.placeOrder(
                            createOrderRequest,
                            request.giftCardCode()
                    );

            return ResponseEntity.ok(orderResponse);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("Unable to place COD order", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Unable to place COD order"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        try {
            CreateOrderRequest createOrderRequest =
                    new CreateOrderRequest(request.shippingAddress());

            OrderResponse orderResponse =
                    orderService.placePaidOrder(
                            createOrderRequest,
                            request.razorpayOrderId(),
                            request.razorpayPaymentId(),
                            request.razorpaySignature(),
                            request.paymentMethod(),
                            request.giftCardCode()
                    );

            return ResponseEntity.ok(orderResponse);

        } catch (IllegalArgumentException e) {
            log.warn("Razorpay verification rejected: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("Unexpected Razorpay verification error", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Payment verification failed"));
        }
    }

    public record CreatePaymentOrderRequest(
            String giftCardCode) {
    }

    public record CodOrderRequest(
            @NotBlank(message = "Shipping address is required")
            String shippingAddress,
            String giftCardCode) {
    }

    public record PaymentVerificationRequest(
            @NotBlank(message = "Shipping address is required")
            String shippingAddress,

            @NotBlank(message = "Razorpay order ID is required")
            String razorpayOrderId,

            @NotBlank(message = "Razorpay payment ID is required")
            String razorpayPaymentId,

            @NotBlank(message = "Razorpay signature is required")
            String razorpaySignature,

            @NotBlank(message = "Payment method is required")
            String paymentMethod,

            String giftCardCode) {
    }
}
