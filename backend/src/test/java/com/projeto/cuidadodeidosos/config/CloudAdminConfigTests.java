package com.projeto.cuidadodeidosos.config;

import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CloudAdminConfigTests {
    private final UserRepository users = mock(UserRepository.class);
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();
    private final CloudAdminConfig config = new CloudAdminConfig();

    @Test void createsNormalizedAdminWithHashedPassword() throws Exception {
        config.createCloudAdmin(users, passwords, " Owner@Example.com ", "a-private-password").run();
        var saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertEquals("owner@example.com", saved.getValue().getEmail());
        assertEquals("ADMIN", saved.getValue().getRole());
        assertTrue(passwords.matches("a-private-password", saved.getValue().getPassword()));
    }

    @Test void rejectsInvalidCredentialsBeforeAccessingDatabase() {
        for (String email : new String[]{"invalid", "has space@example.com"}) {
            assertThrows(IllegalStateException.class, () -> config.createCloudAdmin(users, passwords, email, "a-private-password").run());
        }
        for (String password : new String[]{"admin123", "á".repeat(37)}) {
            assertThrows(IllegalStateException.class, () -> config.createCloudAdmin(users, passwords, "owner@example.com", password).run());
        }
        verifyNoInteractions(users);
    }

    @Test void neverPromotesAnExistingFamily() {
        User user = new User();
        user.setRole("CLIENTE");
        when(users.findByEmail("owner@example.com")).thenReturn(Optional.of(user));
        assertThrows(IllegalStateException.class, () -> config.createCloudAdmin(users, passwords, "owner@example.com", "a-private-password").run());
        verify(users, never()).save(any());
    }

    @Test void preservesExistingAdminPassword() throws Exception {
        User user = new User();
        user.setRole("ADMIN");
        user.setPassword("existing-hash");
        when(users.findByEmail("owner@example.com")).thenReturn(Optional.of(user));
        config.createCloudAdmin(users, passwords, "owner@example.com", "a-private-password").run();
        assertEquals("existing-hash", user.getPassword());
        verify(users, never()).save(any());
    }
}
