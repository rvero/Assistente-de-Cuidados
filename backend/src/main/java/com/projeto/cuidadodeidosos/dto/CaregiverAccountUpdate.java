package com.projeto.cuidadodeidosos.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
public record CaregiverAccountUpdate(
    @Valid @NotNull(message="Informe os dados da conta.") AccountUpdateRequest conta,
    @Valid @NotNull(message="Informe os dados do perfil profissional.") CuidadorProfileData perfil
) {}
