package com.stlabs.ecommerce.returnrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReturnDecisionRequest(
        @NotBlank(message = "Decision is required")
        String decision,

        @Size(max = 1000, message = "Admin note must not exceed 1000 characters")
        String adminNote
) {
}