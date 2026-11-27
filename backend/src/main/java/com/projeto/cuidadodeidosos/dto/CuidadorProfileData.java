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
    @Size(max = 500, message = "O endereço do currículo deve ter no máximo 500 caracteres.") @Pattern(regexp = "^(https?://[^\\s]+)?$", message = "Informe um endereço válido para o currículo, começando com http:// ou https://.") String curriculoUrl,
    @Size(max=100, message="A cidade deve ter até 100 caracteres.") String cidade,
    @DecimalMin(value="0.0", inclusive=false, message="Informe um valor por hora maior que zero.") @Digits(integer=8,fraction=2,message="Informe um valor com até duas casas decimais.") java.math.BigDecimal valorHora,
    @Size(max = 500) String fotoUrl,
    @Size(max = 500) @Pattern(regexp = "^(https://(www[.])?instagram[.]com/[A-Za-z0-9._]+/?)?$", message = "Informe um link de perfil do Instagram válido.") String instagramUrl,
    @Size(max = 500) @Pattern(regexp = "^(https://(www[.])?tiktok[.]com/@[A-Za-z0-9._]+/?)?$", message = "Informe um link de perfil do TikTok válido.") String tiktokUrl
) {}

