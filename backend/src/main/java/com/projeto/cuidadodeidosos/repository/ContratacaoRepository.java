package com.projeto.cuidadodeidosos.repository;
import com.projeto.cuidadodeidosos.entity.Contratacao;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface ContratacaoRepository extends JpaRepository<Contratacao,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Contratacao c where c.id = :id")
    Optional<Contratacao> bloquear(@Param("id") Long id);
    List<Contratacao> findByClienteIdOrderByCriadoEmDesc(Long clienteId);
    List<Contratacao> findByCuidadorIdOrderByCriadoEmDesc(Long cuidadorId);
    List<Contratacao> findAllByOrderByCriadoEmDesc();
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Contratacao c where c.status in ('PENDENTE','ACEITO') and (c.clienteId = :id or c.cuidadorId = :id)")
    List<Contratacao> ativos(@Param("id") Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Contratacao c where c.clienteId = :id or c.cuidadorId = :id")
    List<Contratacao> vinculados(@Param("id") Long id);
}
