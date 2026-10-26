package com.stlabs.ecommerce.common.security;

import com.stlabs.ecommerce.auth.security.AuthenticatedUser;
import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.user.entity.User;
import com.stlabs.ecommerce.user.repository.UserRepository;
import java.util.Objects;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof AuthenticatedUser authenticatedUser) {
            return authenticatedUser.getUser();
        }

        String email = null;

        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String principalString
                && !"anonymousUser".equals(principalString)) {
            email = principalString;
        }

        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new AccessDeniedException("Authenticated user not found"));
        }

        throw new AccessDeniedException(
                "Unsupported authentication principal: "
                        + principal.getClass().getName()
        );
    }

    public boolean isAdmin() {
        return Objects.equals(
                getCurrentUser().getRole().getName(),
                SecurityConstants.ROLE_ADMIN
        );
    }
}
