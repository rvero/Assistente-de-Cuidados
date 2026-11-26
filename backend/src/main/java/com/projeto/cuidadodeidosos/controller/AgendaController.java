package com.projeto.cuidadodeidosos.controller;

import com.projeto.cuidadodeidosos.service.AgendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
public class AgendaController {

    private final AgendaService service;
    private final com.projeto.cuidadodeidosos.service.ContratacaoService contratos;

    public AgendaController(AgendaService service, com.projeto.cuidadodeidosos.service.ContratacaoService contratos) {
        this.service = service;
        this.contratos = contratos;
    }

    // Cuidador escolhe os dias em que atende
    @GetMapping({"/cuidador/disponibilidade", "/api/cuidador/disponibilidade"})
    public AgendaService.DisponibilidadeData meusDias(Authentication auth) {
        return service.meusDias(auth.getName());
    }

    @PutMapping({"/cuidador/disponibilidade", "/api/cuidador/disponibilidade"})
    public AgendaService.DisponibilidadeData salvarDias(
            Authentication auth, @Valid @RequestBody AgendaService.DisponibilidadeData data) {
        return service.salvarDias(auth.getName(), data);
    }

    // Cliente vê os dias de um cuidador
    @GetMapping({"/api/cuidadores/{id}/disponibilidade", "/cliente/cuidadores/{id}/disponibilidade"})
    public AgendaService.DisponibilidadeData diasDoCuidador(@PathVariable("id") Long id) {
        return service.diasDoCuidador(id);
    }

    @GetMapping("/api/cuidadores/{id}/agenda")
    public AgendaService.CalendarioData calendario(@PathVariable("id") Long id,
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        contratos.limparVencidos(id);
        return service.calendario(id, inicio, fim);
    }

    @PostMapping("/api/cliente/agendamentos/lote")
    @ResponseStatus(HttpStatus.CREATED)
    public List<AgendaService.AgendamentoItem> agendarDatas(Authentication auth,
            @Valid @RequestBody AgendaService.AgendamentosRequest request) {
        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.GONE, "Use a contratação para reservar datas.");
    }

    // Cliente marca um dia
    @PostMapping({"/cliente/agendamentos", "/api/cliente/agendamentos"})
    @ResponseStatus(HttpStatus.CREATED)
    public AgendaService.AgendamentoItem agendar(
            Authentication auth, @Valid @RequestBody AgendaService.AgendamentoRequest request) {
        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.GONE, "Use a contratação para reservar datas.");
    }

    @GetMapping({"/cliente/agendamentos", "/api/cliente/agendamentos"})
    public List<AgendaService.AgendamentoItem> meusAgendamentos(Authentication auth) {
        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.GONE, "Consulte seus contratos.");
    }

    // Cuidador vê os serviços marcados
    @GetMapping({"/cuidador/agendamentos", "/api/cuidador/agendamentos"})
    public List<AgendaService.AgendamentoItem> agendaDoCuidador(Authentication auth) {
        return service.agendamentosDoCuidador(auth.getName());
    }
}