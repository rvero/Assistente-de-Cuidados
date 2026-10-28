package com.projeto.cuidadodeidosos.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class AppController {
    @GetMapping({"/", "/inicio", "/login", "/cadastro", "/perfil", "/home-cliente", "/home-cuidador"})
    public String app() { return "forward:/index.html"; }
}

