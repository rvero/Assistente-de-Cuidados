package com.projeto.cuidadodeidosos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Nome é obrigatório") String nome,
        @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres") String password,
        @NotBlank(message = "Tipo é obrigatório")
        @Pattern(regexp = "CUIDADOR|CLIENTE", message = "Tipo deve ser CUIDADOR ou CLIENTE") String tipo
) {}