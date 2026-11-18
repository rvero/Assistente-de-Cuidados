package com.projeto.cuidadodeidosos.dto;

import java.math.BigDecimal;

public record CuidadorBuscaItem(
        Long id,
        String nome,
        String cidade,
        BigDecimal valorHora,
        String descricao,
        String curriculoUrl
) {}