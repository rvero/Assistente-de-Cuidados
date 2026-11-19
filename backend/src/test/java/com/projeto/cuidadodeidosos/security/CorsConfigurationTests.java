package com.projeto.cuidadodeidosos.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.*;

class CorsConfigurationTests {
    @Test void permitsOnlyConfiguredOrigins() {
        var source = new SecurityConfig().corsConfigurationSource(" https://example.netlify.app , https://app.example.com ");
        var config = source.getCorsConfiguration(new MockHttpServletRequest("OPTIONS", "/api/auth/login"));
        assertNotNull(config);
        assertEquals("https://example.netlify.app", config.checkOrigin("https://example.netlify.app"));
        assertNull(config.checkOrigin("https://another.netlify.app"));
        assertNull(config.checkOrigin("http://localhost:4200"));
    }

    @Test void rejectsMissingOrWildcardOrigins() {
        for (String origins : new String[]{"", " , ", "*", "https://*.netlify.app"}) {
            assertThrows(IllegalArgumentException.class, () -> new SecurityConfig().corsConfigurationSource(origins));
        }
    }
}
