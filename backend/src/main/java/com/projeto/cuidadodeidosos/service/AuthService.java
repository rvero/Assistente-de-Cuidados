package com.projeto.cuidadodeidosos.service;

import com.projeto.cuidadodeidosos.dto.LoginRequest;
import com.projeto.cuidadodeidosos.dto.LoginResponse;
import com.projeto.cuidadodeidosos.dto.RegisterRequest;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import com.projeto.cuidadodeidosos.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        User user = new User();
        user.setNome(request.nome().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.tipo());
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        // Se o front enviar o tipo, ele precisa bater com o tipo do cadastro
        if (request.tipo() != null && !request.tipo().isBlank()
                && !request.tipo().equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getNome(), user.getEmail(), user.getRole());
    }
}
