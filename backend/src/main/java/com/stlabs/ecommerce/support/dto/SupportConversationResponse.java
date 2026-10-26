package com.stlabs.ecommerce.support.dto;

import com.stlabs.ecommerce.support.entity.SupportConversation;
import com.stlabs.ecommerce.support.entity.SupportStatus;
import java.time.LocalDateTime;
import java.util.List;

public record SupportConversationResponse(
        Long id,
        String subject,
        SupportStatus status,
        Long customerId,
        String customerName,
        String customerEmail,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long unreadCount,
        List<SupportMessageResponse> messages
) {

    public static SupportConversationResponse from(
            SupportConversation conversation,
            List<SupportMessageResponse> messages,
            long unreadCount
    ) {
        var customer = conversation.getCustomer();

        String customerName = (
                customer.getFirstName() + " " + customer.getLastName()
        ).trim();

        return new SupportConversationResponse(
                conversation.getId(),
                conversation.getSubject(),
                conversation.getStatus(),
                customer.getId(),
                customerName,
                customer.getEmail(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                unreadCount,
                messages
        );
    }
}