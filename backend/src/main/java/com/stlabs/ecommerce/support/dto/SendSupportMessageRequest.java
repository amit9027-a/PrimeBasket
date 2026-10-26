package com.stlabs.ecommerce.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendSupportMessageRequest(

        @NotBlank(message = "Message is required")
        @Size(max = 3000, message = "Message cannot exceed 3000 characters")
        String message

) {
}