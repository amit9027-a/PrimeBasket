package com.stlabs.ecommerce.support.dto;

import com.stlabs.ecommerce.support.entity.SupportMessage;
import java.time.LocalDateTime;

public record SupportMessageResponse(
        Long id,
        Long senderId,
        String senderName,
        String senderRole,
        String message,
        LocalDateTime createdAt
) {

    public static SupportMessageResponse from(SupportMessage entity) {
        String firstName = entity.getSender().getFirstName();
        String lastName = entity.getSender().getLastName();

        String senderName = (firstName + " " + lastName).trim();

        return new SupportMessageResponse(
                entity.getId(),
                entity.getSender().getId(),
                senderName,
                entity.getSender().getRole().getName(),
                entity.getMessage(),
                entity.getCreatedAt()
        );
    }
}