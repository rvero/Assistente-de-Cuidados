package com.projeto.cuidadodeidosos.controller;

import com.projeto.cuidadodeidosos.service.AgendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AgendaController {

    private final AgendaService service;

    public AgendaController(AgendaService service) {
        this.service = service;
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

    // Cliente marca um dia
    @PostMapping({"/cliente/agendamentos", "/api/cliente/agendamentos"})
    @ResponseStatus(HttpStatus.CREATED)
    public AgendaService.AgendamentoItem agendar(
            Authentication auth, @Valid @RequestBody AgendaService.AgendamentoRequest request) {
        return service.agendar(auth.getName(), request);
    }

    @GetMapping({"/cliente/agendamentos", "/api/cliente/agendamentos"})
    public List<AgendaService.AgendamentoItem> meusAgendamentos(Authentication auth) {
        return service.agendamentosDoCliente(auth.getName());
    }

    // Cuidador vê os serviços marcados
    @GetMapping({"/cuidador/agendamentos", "/api/cuidador/agendamentos"})
    public List<AgendaService.AgendamentoItem> agendaDoCuidador(Authentication auth) {
        return service.agendamentosDoCuidador(auth.getName());
    }
}