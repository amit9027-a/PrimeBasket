package com.stlabs.ecommerce.auth.security;

public final class SecurityConstants {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";

    private SecurityConstants() {
    }

    public static String displayRole(String roleName) {
        return roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
    }
}
