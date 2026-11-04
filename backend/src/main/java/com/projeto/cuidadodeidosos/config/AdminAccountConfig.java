package com.projeto.cuidadodeidosos.config;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
@Profile("!test")
public class AdminAccountConfig {
    @Bean CommandLineRunner createDemoAdmin(UserRepository users, PasswordEncoder passwords) {
        return args -> {
            if (users.existsByEmail("admin@admin.com")) return;
            User admin = new User();
            admin.setNome("Administrador"); admin.setEmail("admin@admin.com");
            admin.setPassword(passwords.encode("admin123")); admin.setRole("ADMIN");
            users.save(admin);
        };
    }
}
