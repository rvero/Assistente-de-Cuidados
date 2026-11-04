package com.projeto.cuidadodeidosos.dto;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.br.CPF;
public record AccountUpdateRequest(
    @NotBlank(message="Informe seu nome.") @Size(max=255, message="O nome deve ter até 255 caracteres.") String nome,
    @NotBlank(message="Informe seu e-mail.") @Email(message="Informe um e-mail válido.") @Size(max=255) String email,
    @NotBlank(message="Informe seu CPF.") @CPF(message="Informe um CPF válido.") String cpf,
    @NotBlank(message="Informe sua senha atual.") String senhaAtual,
    @Size(min=6, max=72, message="A nova senha deve ter de 6 a 72 caracteres.") String novaSenha
) {}
