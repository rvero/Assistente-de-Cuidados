package com.projeto.cuidadodeidosos.repository;
import com.projeto.cuidadodeidosos.entity.FamiliaProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface FamiliaProfileRepository extends JpaRepository<FamiliaProfile, Long> {
    Optional<FamiliaProfile> findByUserId(Long userId);
}

