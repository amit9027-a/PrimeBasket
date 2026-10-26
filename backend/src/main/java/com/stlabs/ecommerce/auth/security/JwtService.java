
package com.stlabs.ecommerce.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        claims.put(
                "roles",
                userDetails.getAuthorities()
                        .stream()
                        .map(Object::toString)
                        .toList()
        );

        Date issuedAt = new Date();

        Date expiration = new Date(
                issuedAt.getTime() + jwtExpirationMs
        );

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {
        String username = extractUsername(token);

        return username != null
                && username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is missing. Check app.jwt.secret configuration."
            );
        }

        String secret = jwtSecret.trim();

        // Diagnostic: secret ki value print nahi hogi.
        System.out.println(
                "JWT runtime secret length: " + secret.length()
        );

        final byte[] keyBytes;

        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (DecodingException ex) {
            System.err.println(
                    "JWT Base64 decoder detail: " + ex.getMessage()
            );

            throw new IllegalStateException(
                    "JWT secret is not valid Base64. Check JWT_SECRET configuration.",
                    ex
            );
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must decode to at least 32 bytes. Current length: "
                            + keyBytes.length + " bytes."
            );
        }

        System.out.println(
                "JWT decoded secret bytes: " + keyBytes.length
        );

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
