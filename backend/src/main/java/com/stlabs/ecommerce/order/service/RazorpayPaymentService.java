package com.stlabs.ecommerce.order.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    public Order createOrder(double amount) throws Exception {

        if (!Double.isFinite(amount) || amount <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero."
            );
        }

        long amountInPaise = Math.round(amount * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put(
                "receipt",
                "AM_" + System.currentTimeMillis()
        );

        return razorpayClient.orders.create(orderRequest);
    }

    public boolean verifyPaymentSignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) throws Exception {

        if (razorpayOrderId == null
                || razorpayOrderId.isBlank()
                || razorpayPaymentId == null
                || razorpayPaymentId.isBlank()
                || razorpaySignature == null
                || razorpaySignature.isBlank()
                || razorpaySecret == null
                || razorpaySecret.isBlank()) {
            return false;
        }

        String payload =
                razorpayOrderId + "|" + razorpayPaymentId;

        Mac mac = Mac.getInstance("HmacSHA256");

        SecretKeySpec secretKeySpec = new SecretKeySpec(
                razorpaySecret.trim().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );

        mac.init(secretKeySpec);

        byte[] hash = mac.doFinal(
                payload.getBytes(StandardCharsets.UTF_8)
        );

        StringBuilder generatedSignature = new StringBuilder();

        for (byte b : hash) {
            generatedSignature.append(
                    String.format("%02x", b & 0xff)
            );
        }

        byte[] expected = generatedSignature.toString()
                .getBytes(StandardCharsets.UTF_8);

        byte[] actual = razorpaySignature
                .getBytes(StandardCharsets.UTF_8);

        return MessageDigest.isEqual(expected, actual);
    }

    public boolean verifyOrderAmount(
            String razorpayOrderId,
            double expectedAmount
    ) throws Exception {

        if (razorpayOrderId == null
                || razorpayOrderId.isBlank()
                || !Double.isFinite(expectedAmount)
                || expectedAmount <= 0) {
            return false;
        }

        Order razorpayOrder =
                razorpayClient.orders.fetch(razorpayOrderId);

        // Read Razorpay values as Object to avoid generic type casting errors.
        Object amountValue = razorpayOrder.get("amount");
        Object currencyValue = razorpayOrder.get("currency");

        if (!(amountValue instanceof Number amountNumber)
                || currencyValue == null) {
            return false;
        }

        long actualAmountInPaise = amountNumber.longValue();

        long expectedAmountInPaise =
                Math.round(expectedAmount * 100);

        String currency = currencyValue.toString();

        return actualAmountInPaise == expectedAmountInPaise
                && "INR".equalsIgnoreCase(currency);
    }
}
