package com.stlabs.ecommerce.auth.service;

import com.stlabs.ecommerce.auth.dto.AuthResponse;
import com.stlabs.ecommerce.auth.dto.LoginRequest;
import com.stlabs.ecommerce.auth.dto.RegisterRequest;
import com.stlabs.ecommerce.auth.security.AuthenticatedUser;
import com.stlabs.ecommerce.auth.security.JwtService;
import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.exception.EmailAlreadyExistsException;
import com.stlabs.ecommerce.role.entity.Role;
import com.stlabs.ecommerce.role.repository.RoleRepository;
import com.stlabs.ecommerce.user.dto.UserResponse;
import com.stlabs.ecommerce.user.entity.User;
import com.stlabs.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        Role customerRole = roleRepository.findByName(SecurityConstants.ROLE_CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("Customer role is not configured"));

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(customerRole);

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser, new AuthenticatedUser(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase(),
                        request.password()
                )
        );

        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        return buildAuthResponse(authenticatedUser.getUser(), authenticatedUser);
    }

    private AuthResponse buildAuthResponse(User user, AuthenticatedUser authenticatedUser) {
        return new AuthResponse(
                jwtService.generateToken(authenticatedUser),
                "Bearer",
                jwtService.getJwtExpirationMs() / 1000,
                UserResponse.from(user)
        );
    }
}
