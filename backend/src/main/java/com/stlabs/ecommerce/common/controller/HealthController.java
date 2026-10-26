package com.stlabs.ecommerce.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    // http://localhost:8080/health
    @GetMapping("/health")
    public String health() {
        return "Application Running";
    }
}
