package com.projeto.cuidadodeidosos.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "agendamentos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cuidador_id", "data_servico"}))
public class Agendamento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(name = "cuidador_id", nullable = false)
    private Long cuidadorId;

    @Column(name = "data_servico", nullable = false)
    private LocalDate data;

    @Column(nullable = false, length = 20)
    private String status = "AGENDADO";

    public Agendamento() {}

    public Agendamento(Long clienteId, Long cuidadorId, LocalDate data) {
        this.clienteId = clienteId;
        this.cuidadorId = cuidadorId;
        this.data = data;
    }

    public Long getId() { return id; }
    public Long getClienteId() { return clienteId; }
    public Long getCuidadorId() { return cuidadorId; }
    public LocalDate getData() { return data; }
    public String getStatus() { return status; }
}