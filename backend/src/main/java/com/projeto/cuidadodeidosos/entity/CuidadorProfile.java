package com.projeto.cuidadodeidosos.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "logincuidadores")
public class CuidadorProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(name = "nomecuidador", nullable = false, length = 150)
    private String nomeCuidador;
    @Column(name = "nomesocial", length = 150)
    private String nomeSocial;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genero genero;
    @Column(name = "data_nascimento", nullable = false)
    private java.time.LocalDate dataNascimento;
    @Column(columnDefinition = "TEXT")
    private String descricao;
    @Column(name = "curriculo_url", length = 500)
    private String curriculoUrl;
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getNomeCuidador() { return nomeCuidador; }
    public void setNomeCuidador(String value) { this.nomeCuidador = value; }
    public String getNomeSocial() { return nomeSocial; }
    public void setNomeSocial(String value) { this.nomeSocial = value; }
    public Genero getGenero() { return genero; }
    public void setGenero(Genero value) { this.genero = value; }
    public java.time.LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(java.time.LocalDate value) { this.dataNascimento = value; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String value) { this.descricao = value; }
    public String getCurriculoUrl() { return curriculoUrl; }
    public void setCurriculoUrl(String value) { this.curriculoUrl = value; }
}

