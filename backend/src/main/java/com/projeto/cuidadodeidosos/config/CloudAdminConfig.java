package com.projeto.cuidadodeidosos.config;

import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("cloud")
public class CloudAdminConfig {
    @Bean
    public CommandLineRunner createCloudAdmin(UserRepository users, PasswordEncoder passwords,
            @Value("${admin.email}") String configuredEmail,
            @Value("${admin.password}") String password) {
        return args -> {
            String email = configuredEmail.trim().toLowerCase(Locale.ROOT);
            if (!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+") || password.length() < 12
                    || password.getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new IllegalStateException("Configure ADMIN_EMAIL válido e ADMIN_PASSWORD com pelo menos 12 caracteres e no máximo 72 bytes.");
            }
            var existing = users.findByEmail(email);
            if (existing.isPresent()) {
                if (!"ADMIN".equals(existing.get().getRole())) {
                    throw new IllegalStateException("O e-mail configurado para administração já pertence a outro perfil.");
                }
                return;
            }
            User admin = new User();
            admin.setNome("Administrador");
            admin.setEmail(email);
            admin.setRole("ADMIN");
            admin.setPassword(passwords.encode(password));
            users.save(admin);
        };
    }
}
