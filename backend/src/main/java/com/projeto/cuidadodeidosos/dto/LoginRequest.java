package com.projeto.cuidadodeidosos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
<<<<<<< HEAD
        @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "Senha é obrigatória") String password,
=======
        @NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um endereço de e-mail válido.") String email,
        @NotBlank(message = "Informe sua senha.") String password,
>>>>>>> 2832218 (Atualização frontend e adicionado database)
        String tipo // opcional: "CUIDADOR" ou "CLIENTE"
) {}