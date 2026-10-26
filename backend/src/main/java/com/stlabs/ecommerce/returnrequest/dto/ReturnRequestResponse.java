package com.stlabs.ecommerce.returnrequest.dto;

import com.stlabs.ecommerce.returnrequest.entity.RefundStatus;
import com.stlabs.ecommerce.returnrequest.entity.ReturnStatus;
import java.time.LocalDateTime;

public record ReturnRequestResponse(
        Long id,
        Long orderId,
        Long userId,
        String customerEmail,
        Double orderTotal,
        String reason,
        String description,
        ReturnStatus status,
        RefundStatus refundStatus,
        String adminNote,
        LocalDateTime createdAt
) {
}