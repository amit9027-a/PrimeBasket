
package com.stlabs.ecommerce.config;

import com.stlabs.ecommerce.auth.security.JwtAuthenticationFilter;
import com.stlabs.ecommerce.auth.security.RestAccessDeniedHandler;
import com.stlabs.ecommerce.auth.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/health",
                                "/api/v1/auth/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/categories/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/products/**"
                        ).permitAll()

                        // Return management: admin endpoints
                        .requestMatchers(
                                "/api/v1/returns/admin/**"
                        ).hasRole("ADMIN")

                        // Return management: authenticated customers
                        .requestMatchers(
                                "/api/v1/returns/**"
                        ).authenticated()

                        // Gift Cards: admin-only management
                        .requestMatchers(
                                "/api/v1/gift-cards/admin",
                                "/api/v1/gift-cards/admin/**"
                        ).hasRole("ADMIN")

                        // Gift Cards: balance check requires login
                        .requestMatchers(
                                "/api/v1/gift-cards/balance"
                        ).authenticated()

                        // All other Gift Card endpoints require login
                        .requestMatchers(
                                "/api/v1/gift-cards/**"
                        ).authenticated()

                        // Existing category and product permissions
                        .requestMatchers(
                                "/api/v1/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/v1/products/**"
                        ).hasRole("ADMIN")

                        // Existing cart and order permissions
                        .requestMatchers(
                                "/api/v1/cart/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/v1/orders/**"
                        ).authenticated()

                        // Existing user permissions
                        .requestMatchers(
                                "/api/v1/users/me"
                        ).authenticated()

                        .requestMatchers(
                                "/api/v1/users/**"
                        ).hasRole("ADMIN")

                        // Customer Support: admin-only endpoints
.requestMatchers(
        "/api/v1/support/admin/**"
).hasRole("ADMIN")

// Customer Support: all other endpoints require authentication
.requestMatchers(
        "/api/v1/support/**"
).authenticated()

                        // Preserve existing behavior for other endpoints
                        .anyRequest().permitAll()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authenticationProvider =
                new DaoAuthenticationProvider(userDetailsService);

        authenticationProvider.setPasswordEncoder(passwordEncoder());

        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}
