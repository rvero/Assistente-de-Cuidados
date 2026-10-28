package com.projeto.cuidadodeidosos.controller;
import com.projeto.cuidadodeidosos.dto.*;
import com.projeto.cuidadodeidosos.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
public class ProfileController {
    private final ProfileService profiles;
    public ProfileController(ProfileService profiles) { this.profiles = profiles; }
    @GetMapping({"/cliente/perfil", "/api/cliente/perfil"})
    public ResponseEntity<FamiliaProfileData> familia(Authentication auth) {
        FamiliaProfileData data = profiles.familia(auth.getName());
        return data == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(data);
    }
    @PutMapping({"/cliente/perfil", "/api/cliente/perfil"})
    public FamiliaProfileData salvarFamilia(Authentication auth, @Valid @RequestBody FamiliaProfileData data) {
        return profiles.salvarFamilia(auth.getName(), data);
    }
    @GetMapping({"/cuidador/perfil", "/api/cuidador/perfil"})
    public ResponseEntity<CuidadorProfileData> cuidador(Authentication auth) {
        CuidadorProfileData data = profiles.cuidador(auth.getName());
        return data == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(data);
    }
    @PutMapping({"/cuidador/perfil", "/api/cuidador/perfil"})
    public CuidadorProfileData salvarCuidador(Authentication auth, @Valid @RequestBody CuidadorProfileData data) {
        return profiles.salvarCuidador(auth.getName(), data);
    }
}

