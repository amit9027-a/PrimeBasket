package com.stlabs.ecommerce.support.dto;

import com.stlabs.ecommerce.support.entity.SupportStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSupportStatusRequest(

        @NotNull(message = "Status is required")
        SupportStatus status

) {
}