package com.projeto.cuidadodeidosos.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "loginfamilia")
public class FamiliaProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(name = "nomepaciente", nullable = false, length = 150)
    private String nomePaciente;
    @Column(name = "data_nascimento", nullable = false)
    private java.time.LocalDate dataNascimento;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Finalidade finalidade;
    @Column(columnDefinition = "TEXT")
    private String alergias;
    @Column(columnDefinition = "TEXT")
    private String recomendacoes;
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getNomePaciente() { return nomePaciente; }
    public void setNomePaciente(String value) { this.nomePaciente = value; }
    public java.time.LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(java.time.LocalDate value) { this.dataNascimento = value; }
    public Finalidade getFinalidade() { return finalidade; }
    public void setFinalidade(Finalidade value) { this.finalidade = value; }
    public String getAlergias() { return alergias; }
    public void setAlergias(String value) { this.alergias = value; }
    public String getRecomendacoes() { return recomendacoes; }
    public void setRecomendacoes(String value) { this.recomendacoes = value; }
}

