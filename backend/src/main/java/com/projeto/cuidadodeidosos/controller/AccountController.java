package com.projeto.cuidadodeidosos.controller;
import com.projeto.cuidadodeidosos.dto.*;
import com.projeto.cuidadodeidosos.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
@RestController
@RequestMapping("/api/conta")
public class AccountController {
    private final AccountService accounts;
    public AccountController(AccountService accounts){this.accounts=accounts;}
    public record DeleteRequest(@NotBlank(message="Informe sua senha atual.") String senhaAtual) {}
    @GetMapping public AccountService.AccountData get(Authentication auth){return accounts.get(auth.getName());}
    @PutMapping public LoginResponse update(Authentication auth,@Valid @RequestBody AccountUpdateRequest data){return accounts.update(auth.getName(),data);}
    @PutMapping("/perfil-cuidador") public LoginResponse updateCaregiver(Authentication auth,@Valid @RequestBody CaregiverAccountUpdate data){return accounts.updateCaregiver(auth.getName(),data);}
    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication auth,@Valid @RequestBody DeleteRequest data){accounts.delete(auth.getName(),data.senhaAtual());}
}
