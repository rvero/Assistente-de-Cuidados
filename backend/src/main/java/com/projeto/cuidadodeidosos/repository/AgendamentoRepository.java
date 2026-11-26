package com.projeto.cuidadodeidosos.repository;

import com.projeto.cuidadodeidosos.entity.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findByCuidadorIdAndDataBetweenOrderByDataAsc(Long cuidadorId, LocalDate inicio, LocalDate fim);

    @Modifying
    @Query("delete from Agendamento a where a.clienteId = :id or a.cuidadorId = :id")
    void deleteForUser(@Param("id") Long id);

    void deleteByContratacaoId(Long contratacaoId);

    boolean existsByCuidadorIdAndData(Long cuidadorId, LocalDate data);

    List<Agendamento> findByClienteIdOrderByDataAsc(Long clienteId);

    List<Agendamento> findByCuidadorIdOrderByDataAsc(Long cuidadorId);
}