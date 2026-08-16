package com.stlabs.ecommerce.auth.dto;

import com.stlabs.ecommerce.user.dto.UserResponse;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
