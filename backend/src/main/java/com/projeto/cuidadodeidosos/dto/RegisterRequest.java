package com.projeto.cuidadodeidosos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Informe seu CPF.")
        @org.hibernate.validator.constraints.br.CPF(message = "Informe um CPF válido.") String cpf,
        @NotBlank(message = "Informe seu nome completo.") String nome,
        @NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um endereço de e-mail válido.") String email,
        @NotBlank(message = "Informe sua senha.")
        @Size(min = 6, max = 72, message = "A senha deve ter de 6 a 72 caracteres.") String password,
        @NotBlank(message = "Selecione o tipo de conta.")
        @Pattern(regexp = "CUIDADOR|CLIENTE", message = "Selecione Família ou Cuidador.") String tipo
) {}