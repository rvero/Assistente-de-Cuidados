package com.projeto.cuidadodeidosos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CuidadorServicoData(
        @NotBlank(message = "Cidade é obrigatória") String cidade,
        @NotNull(message = "Valor por hora é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "Valor por hora deve ser maior que zero") BigDecimal valorHora
) {}