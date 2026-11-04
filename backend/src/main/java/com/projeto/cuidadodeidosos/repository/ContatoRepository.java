package com.projeto.cuidadodeidosos.repository;
import com.projeto.cuidadodeidosos.entity.Contato;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface ContatoRepository extends JpaRepository<Contato,Long> {
    Optional<Contato> findByFamiliaIdAndCuidadorId(Long familiaId,Long cuidadorId);
    List<Contato> findByCuidadorIdOrderByCriadoEmDesc(Long cuidadorId);
    @Modifying @Query("delete from Contato c where c.familia.id = :id or c.cuidador.id = :id")
    int deleteForUser(@Param("id")Long id);
}
