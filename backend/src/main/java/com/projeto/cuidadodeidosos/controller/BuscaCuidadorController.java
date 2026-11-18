package com.projeto.cuidadodeidosos.controller;

import com.projeto.cuidadodeidosos.dto.CuidadorBuscaItem;
import com.projeto.cuidadodeidosos.dto.CuidadorServicoData;
import com.projeto.cuidadodeidosos.service.CuidadorBuscaService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
public class BuscaCuidadorController {

    private final CuidadorBuscaService service;

    public BuscaCuidadorController(CuidadorBuscaService service) {
        this.service = service;
    }

    @GetMapping({"/cuidador/servico", "/api/cuidador/servico"})
    public CuidadorServicoData meuServico(Authentication auth) {
        return service.meuServico(auth.getName());
    }

    @PutMapping({"/cuidador/servico", "/api/cuidador/servico"})
    public CuidadorServicoData salvarServico(Authentication auth,
                                             @Valid @RequestBody CuidadorServicoData data) {
        return service.salvarServico(auth.getName(), data);
    }

    @GetMapping({"/api/cuidadores/busca", "/cliente/cuidadores"})
    public List<CuidadorBuscaItem> buscar(
            Authentication auth,
            @RequestParam(name = "cidade", required = false) String cidade,
            @RequestParam(name = "valorMax", required = false) BigDecimal valorMax) {
        return service.buscar(auth.getName(), cidade, valorMax);
    }
}