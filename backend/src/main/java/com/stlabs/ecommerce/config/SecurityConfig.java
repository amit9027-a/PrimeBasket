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
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF because this is a stateless REST API
                .csrf(AbstractHttpConfigurer::disable)

                // Disable browser-based authentication
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                // Use our explicit CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // JWT based authentication - no server sessions
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authentication / authorization error handlers
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )

                // Authentication provider
                .authenticationProvider(authenticationProvider())

                .authorizeHttpRequests(auth -> auth

                        // CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public authentication endpoints
                        .requestMatchers(
                                "/health",
                                "/api/v1/auth/**"
                        ).permitAll()

                        // Public GET categories
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/categories/**"
                        ).permitAll()

                        // Public GET products
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/products/**"
                        ).permitAll()

                        // Admin category operations
                        .requestMatchers(
                                "/api/v1/categories/**"
                        ).hasRole("ADMIN")

                        // Admin product operations
                        .requestMatchers(
                                "/api/v1/products/**"
                        ).hasRole("ADMIN")

                        // Authenticated cart operations
                        .requestMatchers(
                                "/api/v1/cart/**"
                        ).authenticated()

                        // Authenticated order operations
                        .requestMatchers(
                                "/api/v1/orders/**"
                        ).authenticated()

                        // Current user
                        .requestMatchers(
                                "/api/v1/users/me"
                        ).authenticated()

                        // Admin user operations
                        .requestMatchers(
                                "/api/v1/users/**"
                        ).hasRole("ADMIN")

                        // Other endpoints
                        .anyRequest().permitAll()
                )

                // JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * CORS configuration for:
     * - Vercel production frontend
     * - Vercel preview frontend
     * - Local development
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "https://prime-basket-1eim.vercel.app",
                "https://prime-basket-1eim-git-main-amit921.vercel.app",
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Allow all request headers.
        // This is useful for Authorization, Content-Type,
        // and browser-generated CORS headers.
        configuration.setAllowedHeaders(List.of("*"));

        // Headers that frontend JavaScript is allowed to read
        configuration.setExposedHeaders(List.of(
                "Authorization"
        ));

        // Required if frontend sends credentials/cookies
        configuration.setAllowCredentials(true);

        // Cache CORS preflight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
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
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}