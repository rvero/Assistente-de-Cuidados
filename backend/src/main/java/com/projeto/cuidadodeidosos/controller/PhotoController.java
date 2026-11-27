package com.projeto.cuidadodeidosos.controller;

import com.projeto.cuidadodeidosos.repository.UserRepository;
import com.projeto.cuidadodeidosos.service.PhotoService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class PhotoController {
    private final PhotoService photos;
    private final UserRepository users;
    public PhotoController(PhotoService photos, UserRepository users) { this.photos=photos; this.users=users; }
    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/api/cuidador/foto")
    public Map<String,String> enviar(Authentication auth, @RequestParam("foto") MultipartFile foto) {
        var user=users.findByEmail(auth.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        user=users.bloquear(user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return Map.of("fotoUrl",photos.enviar(foto,user.getId()));
    }
}
