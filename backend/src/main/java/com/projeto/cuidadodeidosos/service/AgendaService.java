package com.projeto.cuidadodeidosos.service;

import com.projeto.cuidadodeidosos.entity.Agendamento;
import com.projeto.cuidadodeidosos.entity.DiaSemana;
import com.projeto.cuidadodeidosos.entity.DisponibilidadeCuidador;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.AgendamentoRepository;
import com.projeto.cuidadodeidosos.repository.DisponibilidadeCuidadorRepository;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class AgendaService {

    public record DisponibilidadeData(
            @NotNull(message = "Informe os dias da semana") List<DiaSemana> dias) {}

    public record AgendamentoRequest(
            @NotNull(message = "Cuidador é obrigatório") Long cuidadorId,
            @NotNull(message = "Data é obrigatória") LocalDate data) {}

    public record AgendamentosRequest(
            @NotNull Long cuidadorId,
            @NotNull @Size(min = 1, max = 31, message = "Selecione de 1 a 31 datas") List<@NotNull LocalDate> datas) {}

    public record CalendarioData(List<DiaSemana> dias, List<LocalDate> datasOcupadas) {}

    @Transactional(readOnly = true)
    public CalendarioData calendario(Long cuidadorId, LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio) || ChronoUnit.DAYS.between(inicio, fim) > 62) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intervalo inválido");
        }
        var disponibilidade = diasDoCuidador(cuidadorId);
        var ocupadas = agendamentos.findByCuidadorIdAndDataBetweenOrderByDataAsc(cuidadorId, inicio, fim)
                .stream().map(Agendamento::getData).toList();
        return new CalendarioData(disponibilidade.dias(), ocupadas);
    }

    public List<AgendamentoItem> agendarDatas(String email, AgendamentosRequest request) {
        // Uma única transação: se alguma data falhar, nenhuma reserva é gravada.
        if (new LinkedHashSet<>(request.datas()).size() != request.datas().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Remova as datas repetidas");
        }
        return request.datas().stream().sorted()
                .map(data -> agendar(email, new AgendamentoRequest(request.cuidadorId(), data))).toList();
    }

    public record AgendamentoItem(Long id, Long cuidadorId, String cuidador,
                                  Long clienteId, String cliente,
                                  LocalDate data, DiaSemana diaSemana, String status) {}

    private final UserRepository users;
    private final DisponibilidadeCuidadorRepository disponibilidades;
    private final AgendamentoRepository agendamentos;

    public AgendaService(UserRepository users,
                         DisponibilidadeCuidadorRepository disponibilidades,
                         AgendamentoRepository agendamentos) {
        this.users = users;
        this.disponibilidades = disponibilidades;
        this.agendamentos = agendamentos;
    }

    private User usuario(String email, String role) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!role.equals(user.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return user;
    }

    private List<DiaSemana> dias(Long cuidadorId) {
        return disponibilidades.findByCuidadorId(cuidadorId).stream()
                .map(DisponibilidadeCuidador::getDiaSemana)
                .sorted()
                .toList();
    }

    private String nome(Long userId) {
        return users.findById(userId).map(User::getNome).orElse("Conta removida");
    }

    private AgendamentoItem item(Agendamento a) {
        return new AgendamentoItem(a.getId(), a.getCuidadorId(), nome(a.getCuidadorId()),
                a.getClienteId(), nome(a.getClienteId()),
                a.getData(), DiaSemana.de(a.getData()), a.getStatus());
    }

    // ----- Cuidador: dias em que atende -----

    @Transactional(readOnly = true)
    public DisponibilidadeData meusDias(String email) {
        User cuidador = usuario(email, "CUIDADOR");
        return new DisponibilidadeData(dias(cuidador.getId()));
    }

    // Substitui a lista de dias pela nova lista enviada
    public DisponibilidadeData salvarDias(String email, DisponibilidadeData d) {
        User cuidador = usuario(email, "CUIDADOR");

        Set<DiaSemana> novos = EnumSet.noneOf(DiaSemana.class);
        for (DiaSemana dia : d.dias()) {
            if (dia != null) novos.add(dia);
        }

        disponibilidades.deleteByCuidadorId(cuidador.getId());
        disponibilidades.flush();
        for (DiaSemana dia : novos) {
            disponibilidades.save(new DisponibilidadeCuidador(cuidador.getId(), dia));
        }
        return new DisponibilidadeData(List.copyOf(novos));
    }

    // ----- Cliente: ver dias do cuidador e marcar serviço -----

    @Transactional(readOnly = true)
    public DisponibilidadeData diasDoCuidador(Long cuidadorId) {
        users.findById(cuidadorId)
                .filter(u -> "CUIDADOR".equals(u.getRole()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuidador não encontrado"));
        return new DisponibilidadeData(dias(cuidadorId));
    }

    public AgendamentoItem agendar(String email, AgendamentoRequest r) {
        User cliente = usuario(email, "CLIENTE");

        User cuidador = users.findById(r.cuidadorId())
                .filter(u -> "CUIDADOR".equals(u.getRole()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuidador não encontrado"));

        if (r.data().isBefore(LocalDate.now(ZoneId.of("America/Sao_Paulo")))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data não pode estar no passado");
        }
        if (!disponibilidades.existsByCuidadorIdAndDiaSemana(cuidador.getId(), DiaSemana.de(r.data()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O cuidador não atende neste dia da semana");
        }
        if (agendamentos.existsByCuidadorIdAndData(cuidador.getId(), r.data())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O cuidador já tem um serviço marcado nesta data");
        }

        try {
            Agendamento salvo = agendamentos.saveAndFlush(
                    new Agendamento(cliente.getId(), cuidador.getId(), r.data()));
            return item(salvo);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O cuidador já tem um serviço marcado nesta data");
        }
    }

    @Transactional(readOnly = true)
    public List<AgendamentoItem> agendamentosDoCliente(String email) {
        User cliente = usuario(email, "CLIENTE");
        return agendamentos.findByClienteIdOrderByDataAsc(cliente.getId()).stream().map(this::item).toList();
    }

    @Transactional(readOnly = true)
    public List<AgendamentoItem> agendamentosDoCuidador(String email) {
        User cuidador = usuario(email, "CUIDADOR");
        return agendamentos.findByCuidadorIdOrderByDataAsc(cuidador.getId()).stream().map(this::item).toList();
    }
}