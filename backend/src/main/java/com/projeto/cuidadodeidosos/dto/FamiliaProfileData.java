package com.projeto.cuidadodeidosos.dto;
import com.projeto.cuidadodeidosos.entity.Finalidade;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record FamiliaProfileData(
    @NotBlank(message = "Informe o nome da pessoa que receberá os cuidados.") @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.") String nomePaciente,
    @NotNull(message = "Informe a data de nascimento.") @Past(message = "A data de nascimento deve ser anterior à data de hoje.") LocalDate dataNascimento,
    @NotNull(message = "Selecione o motivo do cuidado.") Finalidade finalidade,
    @Size(max = 5000, message = "As informações sobre alergias devem ter no máximo 5.000 caracteres.") String alergias,
    @Size(max = 5000, message = "As orientações para o cuidado devem ter no máximo 5.000 caracteres.") String recomendacoes
) {}

