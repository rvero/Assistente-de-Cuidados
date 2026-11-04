package com.projeto.cuidadodeidosos.service;
import com.projeto.cuidadodeidosos.dto.*;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import com.projeto.cuidadodeidosos.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;
@Service
public class AccountService {
    private final UserRepository users; private final PasswordEncoder passwords; private final JwtService jwt; private final DirectoryService directory; private final ProfileService profiles;
    public AccountService(UserRepository users, PasswordEncoder passwords, JwtService jwt, DirectoryService directory, ProfileService profiles) {this.users=users;this.passwords=passwords;this.jwt=jwt;this.directory=directory;this.profiles=profiles;}
    public record AccountData(String nome, String email, String cpf) {}
    private User owner(String email) {return users.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));}
    private void confirm(User user,String password) {if(!passwords.matches(password,user.getPassword()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A senha atual não confere.");}
    @Transactional(readOnly=true)
    public AccountData get(String email) {User u=owner(email);return new AccountData(u.getNome(),u.getEmail(),u.getCpf());}
    @Transactional
    public LoginResponse update(String email, AccountUpdateRequest d) {
        User u=owner(email);confirm(u,d.senhaAtual());String nextEmail=d.email().trim().toLowerCase(Locale.ROOT);String cpf=d.cpf().replaceAll("[^0-9]", "");
        if("admin@admin.com".equals(nextEmail))throw new ResponseStatusException(HttpStatus.CONFLICT,"Este e-mail é reservado à administração.");
        if(users.findByEmail(nextEmail).filter(other->!other.getId().equals(u.getId())).isPresent())throw new ResponseStatusException(HttpStatus.CONFLICT,"Este e-mail já está cadastrado.");
        if(users.findByCpf(cpf).filter(other->!other.getId().equals(u.getId())).isPresent())throw new ResponseStatusException(HttpStatus.CONFLICT,"Este CPF já está cadastrado.");
        u.setNome(d.nome().trim());u.setEmail(nextEmail);u.setCpf(cpf);
        if(d.novaSenha()!=null)u.setPassword(passwords.encode(d.novaSenha()));
        u.renewSessions();
        users.saveAndFlush(u);return new LoginResponse(jwt.generateToken(u),u.getNome(),u.getEmail(),u.getRole());
    }
    @Transactional
    public LoginResponse updateCaregiver(String email, CaregiverAccountUpdate data) {
        profiles.salvarCuidador(email, data.perfil());
        return update(email, data.conta());
    }
    @Transactional
    public void delete(String email,String password) {User u=owner(email);confirm(u,password);directory.delete(u.getId());}
}
