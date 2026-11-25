package com.projeto.cuidadodeidosos.repository;

import com.projeto.cuidadodeidosos.entity.DiaSemana;
import com.projeto.cuidadodeidosos.entity.DisponibilidadeCuidador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisponibilidadeCuidadorRepository extends JpaRepository<DisponibilidadeCuidador, Long> {
    List<DisponibilidadeCuidador> findByCuidadorId(Long cuidadorId);

    boolean existsByCuidadorIdAndDiaSemana(Long cuidadorId, DiaSemana diaSemana);

    void deleteByCuidadorId(Long cuidadorId);
}