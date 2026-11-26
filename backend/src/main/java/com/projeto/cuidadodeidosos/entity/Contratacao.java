package com.projeto.cuidadodeidosos.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Set;
import java.util.TreeSet;

@Entity
@Table(name = "contratacoes")
public class Contratacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long clienteId;
    private Long cuidadorId;
    private String familia;
    private String cuidador;
    @Column(length = 100) private String cidade;
    @Column(precision = 10, scale = 2) private BigDecimal valorHora;
    @Column(nullable = false, length = 20) private String status = "PENDENTE";
    @Column(nullable = false) private Instant criadoEm = Instant.now();
    @Column(nullable = false) private boolean legado;
    public boolean isLegado() { return legado; }
    private Instant aceitoEm;
    private Instant encerradoEm;
    private String pacienteNome;
    private String finalidade;
    @Column(columnDefinition = "TEXT") private String alergias;
    @Column(columnDefinition = "TEXT") private String orientacoes;
    @ElementCollection
    @CollectionTable(name = "contratacao_datas", joinColumns = @JoinColumn(name = "contratacao_id"))
    @Column(name = "data_servico", nullable = false)
    private Set<LocalDate> datas = new TreeSet<>();

    protected Contratacao() {}
    public Contratacao(User cliente, User profissional, FamiliaProfile paciente, CuidadorProfile perfil, Set<LocalDate> datas) {
        clienteId = cliente.getId(); cuidadorId = profissional.getId();
        familia = cliente.getNome(); cuidador = profissional.getNome();
        if (perfil != null) { cuidador = perfil.getNomeCuidador(); cidade = perfil.getCidade(); valorHora = perfil.getValorHora(); }
        pacienteNome = paciente.getNomePaciente(); finalidade = paciente.getFinalidade().name();
        alergias = paciente.getAlergias(); orientacoes = paciente.getRecomendacoes();
        this.datas.addAll(datas);
    }
    public Long getId() { return id; }
    public Long getClienteId() { return clienteId; }
    public Long getCuidadorId() { return cuidadorId; }
    public String getFamilia() { return familia; }
    public String getCuidador() { return cuidador; }
    public String getCidade() { return cidade; }
    public BigDecimal getValorHora() { return valorHora; }
    public String getStatus() { return status; }
    public Instant getCriadoEm() { return criadoEm; }
    public Instant getAceitoEm() { return aceitoEm; }
    public Instant getEncerradoEm() { return encerradoEm; }
    public Set<LocalDate> getDatas() { return datas; }
    public String getPacienteNome() { return pacienteNome; }
    public String getFinalidade() { return finalidade; }
    public String getAlergias() { return alergias; }
    public String getOrientacoes() { return orientacoes; }
    public boolean ativo() { return "PENDENTE".equals(status) || "ACEITO".equals(status); }
    public void aceitar() { status = "ACEITO"; aceitoEm = Instant.now(); }
    public void encerrar(String estado) { status = estado; encerradoEm = Instant.now(); }
    public void removerDados(Long userId) {
        if (userId.equals(clienteId)) { familia = "Conta removida"; pacienteNome = null; finalidade = null; alergias = null; orientacoes = null; }
        if (userId.equals(cuidadorId)) { cuidador = "Conta removida"; cidade = null; valorHora = null; }
    }
}
