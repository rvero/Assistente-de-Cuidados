package com.projeto.cuidadodeidosos.dto;
import com.projeto.cuidadodeidosos.entity.Genero;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record CuidadorProfileData(
    @NotBlank(message = "Informe o nome completo do cuidador.") @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.") String nomeCuidador,
    @Size(max = 150, message = "O nome social deve ter no máximo 150 caracteres.") String nomeSocial,
    @NotNull(message = "Selecione o gênero.") Genero genero,
    @NotNull(message = "Informe a data de nascimento.") @Past(message = "A data de nascimento deve ser anterior à data de hoje.") LocalDate dataNascimento,
    @Size(max = 5000, message = "A experiência profissional deve ter no máximo 5.000 caracteres.") String descricao,
    @Size(max = 500, message = "O endereço do currículo deve ter no máximo 500 caracteres.") @Pattern(regexp = "^(https?://[^\\s]+)?$", message = "Informe um endereço válido para o currículo, começando com http:// ou https://.") String curriculoUrl
) {}

