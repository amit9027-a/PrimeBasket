package com.stlabs.ecommerce.common.security;

import com.stlabs.ecommerce.auth.security.AuthenticatedUser;
import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public User getCurrentUser() {
        return getPrincipal().getUser();
    }

    public boolean isAdmin() {
        return getCurrentUser().getRole().getName().equals(SecurityConstants.ROLE_ADMIN);
    }

    private AuthenticatedUser getPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (AuthenticatedUser) authentication.getPrincipal();
    }
}
