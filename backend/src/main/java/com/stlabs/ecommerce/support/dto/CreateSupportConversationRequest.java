package com.stlabs.ecommerce.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupportConversationRequest(

        @NotBlank(message = "Subject is required")
        @Size(max = 150, message = "Subject cannot exceed 150 characters")
        String subject,

        @NotBlank(message = "Message is required")
        @Size(max = 3000, message = "Message cannot exceed 3000 characters")
        String message

) {
}