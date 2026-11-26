package com.projeto.cuidadodeidosos.service;

import com.projeto.cuidadodeidosos.entity.*;
import com.projeto.cuidadodeidosos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Service
@Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
public class ContratacaoService {
    private final UserRepository users;
    private final ContratacaoRepository contratos;
    private final FamiliaProfileRepository familias;
    private final CuidadorProfileRepository cuidadores;
    private final AgendamentoRepository reservas;
    private final AgendaService agenda;
    public ContratacaoService(UserRepository users, ContratacaoRepository contratos, FamiliaProfileRepository familias,
            CuidadorProfileRepository cuidadores, AgendamentoRepository reservas, AgendaService agenda) {
        this.users=users; this.contratos=contratos; this.familias=familias; this.cuidadores=cuidadores; this.reservas=reservas; this.agenda=agenda;
    }
    public record Item(Long id, Long clienteId, Long cuidadorId, String familia, String cuidador,
            String cidade, BigDecimal valorHora, String status, Instant criadoEm, Instant aceitoEm, Instant encerradoEm, boolean legado, List<LocalDate> datas) {}
    public record Paciente(String nomePaciente, String finalidade, String alergias, String recomendacoes) {}
    public record Detalhe(Item contrato, Paciente paciente) {}
    private User usuario(String email, String papel) {
        User u=users.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!papel.equals(u.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return u;
    }
    private Item item(Contratacao c) {
        return new Item(c.getId(),c.getClienteId(),c.getCuidadorId(),c.getFamilia(),c.getCuidador(),c.getCidade(),c.getValorHora(),
                c.getStatus(),c.getCriadoEm(),c.getAceitoEm(),c.getEncerradoEm(),c.isLegado(),c.getDatas().stream().sorted().toList());
    }
    private LocalDate hoje() { return LocalDate.now(ZoneId.of("America/Sao_Paulo")); }
    private void encerrarVencidos(Long userId) {
        for (Contratacao c: contratos.ativos(userId)) {
            LocalDate limite="PENDENTE".equals(c.getStatus()) ? Collections.min(c.getDatas()) : Collections.max(c.getDatas());
            if (limite.isBefore(hoje())) {
                c.encerrar("PENDENTE".equals(c.getStatus()) ? "EXPIRADO" : "CONCLUIDO");
                reservas.deleteByContratacaoId(c.getId());
            }
        }
    }
    public void limparVencidos(Long cuidadorId) { encerrarVencidos(cuidadorId); }

    public Item solicitar(String email, AgendaService.AgendamentosRequest request) {
        User cliente=usuario(email,"CLIENTE");
        // Serializa pedidos da mesma família e reservas para o mesmo cuidador.
        users.bloquear(cliente.getId()).orElseThrow();
        encerrarVencidos(cliente.getId());
        if (contratos.ativos(cliente.getId()).stream().anyMatch(c->c.getClienteId().equals(cliente.getId())))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Você já tem um pedido ou contrato em andamento.");
        User cuidador=users.bloquear(request.cuidadorId()).filter(u->"CUIDADOR".equals(u.getRole()))
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Cuidador não encontrado."));
        encerrarVencidos(cuidador.getId());
        FamiliaProfile paciente=familias.findByUserId(cliente.getId())
                .orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Preencha os dados do paciente em Opções."));
        var datas=new TreeSet<>(request.datas());
        if (datas.size()!=request.datas().size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Remova as datas repetidas.");
        var c=contratos.saveAndFlush(new Contratacao(cliente,cuidador,paciente,cuidadores.findByUserId(cuidador.getId()).orElse(null),datas));
        var itens=agenda.agendarDatas(email,request);
        for (var reserva:itens) reservas.findById(reserva.id()).orElseThrow().setContratacaoId(c.getId());
        return item(c);
    }
    public Item atual(String email) {
        User u=usuario(email,"CLIENTE"); encerrarVencidos(u.getId());
        return contratos.ativos(u.getId()).stream().filter(c->c.getClienteId().equals(u.getId())).findFirst().map(this::item).orElse(null);
    }
    public List<Item> listar(String email,String papel) {
        User u=usuario(email,papel); encerrarVencidos(u.getId());
        return ("CLIENTE".equals(papel)?contratos.findByClienteIdOrderByCriadoEmDesc(u.getId()):contratos.findByCuidadorIdOrderByCriadoEmDesc(u.getId())).stream().map(this::item).toList();
    }
    public List<Item> historicoAdmin(String email) {
        usuario(email,"ADMIN");
        return contratos.findAllByOrderByCriadoEmDesc().stream().map(this::item).toList();
    }
    public Detalhe detalhe(String email,Long id) {
        User u=usuario(email,"CUIDADOR"); encerrarVencidos(u.getId());
        var c=contratos.findById(id).filter(v->v.getCuidadorId().equals(u.getId()))
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido não encontrado."));
        Paciente p=c.ativo()?new Paciente(c.getPacienteNome(),c.getFinalidade(),c.getAlergias(),c.getOrientacoes()):null;
        return new Detalhe(item(c),p);
    }
    public Item responder(String email,Long id,boolean aceitar) {
        User u=usuario(email,"CUIDADOR");
        var c=contratos.bloquear(id).filter(v->v.getCuidadorId().equals(u.getId()))
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido não encontrado."));
        if (!"PENDENTE".equals(c.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT,"Este pedido já foi encerrado ou respondido.");
        if (Collections.min(c.getDatas()).isBefore(hoje())) throw new ResponseStatusException(HttpStatus.CONFLICT,"O prazo deste pedido terminou.");
        if (aceitar) c.aceitar(); else { c.encerrar("RECUSADO"); reservas.deleteByContratacaoId(c.getId()); }
        return item(c);
    }
    public Item cancelar(String email,Long id) {
        User u=usuario(email,"CLIENTE");
        var c=contratos.bloquear(id).filter(v->v.getClienteId().equals(u.getId()))
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contrato não encontrado."));
        if (!c.ativo()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Este contrato já foi encerrado.");
        c.encerrar("CANCELADO"); reservas.deleteByContratacaoId(c.getId()); return item(c);
    }
    public void removerConta(Long id) {
        for (var c:contratos.vinculados(id)) {
            if(c.ativo()) { c.encerrar("CANCELADO"); reservas.deleteByContratacaoId(c.getId()); }
            c.removerDados(id);
        }
    }
}
