package com.stlabs.ecommerce.user.dto;

import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.user.entity.User;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String role
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                SecurityConstants.displayRole(user.getRole().getName())
        );
    }
}
