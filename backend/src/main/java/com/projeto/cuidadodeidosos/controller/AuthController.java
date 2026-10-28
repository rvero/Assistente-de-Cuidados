package com.projeto.cuidadodeidosos.controller;

import com.projeto.cuidadodeidosos.dto.LoginRequest;
import com.projeto.cuidadodeidosos.dto.LoginResponse;
import com.projeto.cuidadodeidosos.dto.RegisterRequest;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import com.projeto.cuidadodeidosos.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping({"", "/api"})
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Usuário cadastrado com sucesso"));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Rota protegida: serve para testar se o token está funcionando
    @GetMapping("/users/me")
    public Map<String, String> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
        return Map.of("nome", user.getNome(), "email", user.getEmail(), "role", user.getRole());
    }
}