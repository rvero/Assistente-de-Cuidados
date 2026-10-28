package com.projeto.cuidadodeidosos.repository;
import com.projeto.cuidadodeidosos.entity.CuidadorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CuidadorProfileRepository extends JpaRepository<CuidadorProfile, Long> {
    Optional<CuidadorProfile> findByUserId(Long userId);
}

