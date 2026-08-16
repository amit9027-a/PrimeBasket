package com.stlabs.ecommerce.order.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    private final RazorpayClient razorpayClient;

    // IMPORTANT:
    // Yahan apni Razorpay SECRET KEY use karni hai.
    // Secret key frontend mein kabhi mat rakhna.
    private final String razorpaySecret = System.getenv("RAZORPAY_KEY_SECRET");

    public Order createOrder(double amount) throws Exception {

        JSONObject orderRequest = new JSONObject();

        long amountInPaise = Math.round(amount * 100);

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put(
                "receipt",
                "order_receipt_" + System.currentTimeMillis()
        );

        return razorpayClient.orders.create(orderRequest);
    }

    public boolean verifyPaymentSignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) throws Exception {

        String payload =
                razorpayOrderId + "|" + razorpayPaymentId;

        Mac mac = Mac.getInstance("HmacSHA256");

        SecretKeySpec secretKeySpec = new SecretKeySpec(
                razorpaySecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );

        mac.init(secretKeySpec);

        byte[] hash =
                mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

        StringBuilder generatedSignature = new StringBuilder();

        for (byte b : hash) {
            generatedSignature.append(
                    String.format("%02x", b)
            );
        }

        return generatedSignature
                .toString()
                .equals(razorpaySignature);
    }
}