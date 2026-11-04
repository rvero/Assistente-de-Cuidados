package com.projeto.cuidadodeidosos.controller;

import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
public class HomeController {

    private final UserRepository userRepository;

    public HomeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Rota protegida: exige token
    @GetMapping("/home")
    public Map<String, Object> home(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        boolean cuidador = "CUIDADOR".equals(user.getRole());

        String mensagem = cuidador
                ? "Olá, " + user.getNome() + "! Veja os clientes que precisam de cuidados."
                : "Olá, " + user.getNome() + "! Encontre o cuidador ideal para o seu idoso.";

        List<String> menu = cuidador
                ? List.of("Meus clientes", "Agenda", "Perfil")
                : List.of("Buscar cuidadores", "Meus idosos", "Perfil");

        return Map.of(
                "nome", user.getNome(),
                "role", user.getRole(),
                "mensagem", mensagem,
                "menu", menu
        );
    }
}