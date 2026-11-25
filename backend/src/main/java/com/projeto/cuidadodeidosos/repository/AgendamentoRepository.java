package com.projeto.cuidadodeidosos.repository;

import com.projeto.cuidadodeidosos.entity.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    boolean existsByCuidadorIdAndData(Long cuidadorId, LocalDate data);

    List<Agendamento> findByClienteIdOrderByDataAsc(Long clienteId);

    List<Agendamento> findByCuidadorIdOrderByDataAsc(Long cuidadorId);
}