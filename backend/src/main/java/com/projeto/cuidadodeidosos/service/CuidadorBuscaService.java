package com.projeto.cuidadodeidosos.service;

import com.projeto.cuidadodeidosos.dto.CuidadorBuscaItem;
import com.projeto.cuidadodeidosos.dto.CuidadorServicoData;
import com.projeto.cuidadodeidosos.entity.CuidadorProfile;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.CuidadorProfileRepository;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CuidadorBuscaService {

    private final UserRepository users;
    private final CuidadorProfileRepository carers;

    public CuidadorBuscaService(UserRepository users, CuidadorProfileRepository carers) {
        this.users = users;
        this.carers = carers;
    }

    private User usuario(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @Transactional(readOnly = true)
    public CuidadorServicoData meuServico(String email) {
        User user = usuario(email);
        if (!"CUIDADOR".equals(user.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return carers.findByUserId(user.getId())
                .map(p -> new CuidadorServicoData(p.getCidade(), p.getValorHora()))
                .orElse(new CuidadorServicoData(null, null));
    }

    // Só atualiza cidade e valor; o resto do perfil continua sendo salvo em /cuidador/perfil
    @Transactional
    public CuidadorServicoData salvarServico(String email, CuidadorServicoData d) {
        User user = usuario(email);
        if (!"CUIDADOR".equals(user.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        CuidadorProfile p = carers.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cadastre primeiro o perfil do cuidador em /cuidador/perfil"));

        p.setCidade(d.cidade().trim());
        p.setValorHora(d.valorHora());
        carers.save(p);
        return new CuidadorServicoData(p.getCidade(), p.getValorHora());
    }

    // Filtros opcionais. Só aparecem cuidadores que já informaram cidade e valor.
    @Transactional(readOnly = true)
    public List<CuidadorBuscaItem> buscar(String email, String cidade, BigDecimal valorMax) {
        User user = usuario(email);
        if (!"CLIENTE".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        String filtroCidade = cidade == null ? "" : cidade.trim();
        BigDecimal filtroValor = valorMax == null ? new BigDecimal("99999999") : valorMax;

        return carers
                .findByCidadeContainingIgnoreCaseAndValorHoraLessThanEqualOrderByValorHoraAsc(filtroCidade, filtroValor)
                .stream()
                .map(p -> new CuidadorBuscaItem(
                        p.getUser().getId(),
                        (p.getNomeSocial() != null && !p.getNomeSocial().isBlank())
                                ? p.getNomeSocial() : p.getNomeCuidador(),
                        p.getCidade(),
                        p.getValorHora(),
                        p.getDescricao(),
                        p.getCurriculoUrl()))
                .toList();
    }
}