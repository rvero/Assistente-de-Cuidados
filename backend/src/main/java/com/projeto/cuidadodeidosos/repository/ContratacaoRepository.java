package com.projeto.cuidadodeidosos.repository;
import com.projeto.cuidadodeidosos.entity.Contratacao;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
// SQL explícito evita FOR UPDATE OF <alias>, incompatível com a resolução de nomes no TiDB.
public interface ContratacaoRepository extends JpaRepository<Contratacao,Long> {
    @Query(value = "select * from contratacoes where id = :id for update", nativeQuery = true)
    Optional<Contratacao> bloquear(@Param("id") Long id);
    List<Contratacao> findByClienteIdOrderByCriadoEmDesc(Long clienteId);
    List<Contratacao> findByCuidadorIdOrderByCriadoEmDesc(Long cuidadorId);
    List<Contratacao> findAllByOrderByCriadoEmDesc();
    @Query(value = "select * from contratacoes where status in ('PENDENTE','ACEITO') and (cliente_id = :id or cuidador_id = :id) for update", nativeQuery = true)
    List<Contratacao> ativos(@Param("id") Long id);
    @Query(value = "select * from contratacoes where cliente_id = :id or cuidador_id = :id for update", nativeQuery = true)
    List<Contratacao> vinculados(@Param("id") Long id);
}
