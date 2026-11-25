package com.projeto.cuidadodeidosos.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "disponibilidade_cuidador",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cuidador_id", "dia_semana"}))
public class DisponibilidadeCuidador {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cuidador_id", nullable = false)
    private Long cuidadorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 10)
    private DiaSemana diaSemana;

    public DisponibilidadeCuidador() {}

    public DisponibilidadeCuidador(Long cuidadorId, DiaSemana diaSemana) {
        this.cuidadorId = cuidadorId;
        this.diaSemana = diaSemana;
    }

    public Long getId() { return id; }
    public Long getCuidadorId() { return cuidadorId; }
    public DiaSemana getDiaSemana() { return diaSemana; }
}