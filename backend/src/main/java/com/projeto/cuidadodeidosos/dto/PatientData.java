package com.projeto.cuidadodeidosos.dto;
import jakarta.validation.constraints.*;
import com.projeto.cuidadodeidosos.entity.Finalidade;
public record PatientData(
 @NotBlank(message="Informe o nome do paciente.") @Size(max=150) String nomePaciente,
 @NotNull(message="Selecione o motivo do cuidado.") Finalidade finalidade,
 @Size(max=5000) String alergias,
 @Size(max=5000) String recomendacoes
) {}
