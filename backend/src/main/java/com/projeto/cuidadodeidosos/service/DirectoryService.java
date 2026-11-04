package com.projeto.cuidadodeidosos.service;
import com.projeto.cuidadodeidosos.entity.*;
import com.projeto.cuidadodeidosos.dto.*;
import com.projeto.cuidadodeidosos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@Service
@Transactional(readOnly = true)
public class DirectoryService {
    private final UserRepository users;
    private final CuidadorProfileRepository carers;
    private final FamiliaProfileRepository families;
    private final ContatoRepository contacts;
    public DirectoryService(UserRepository users, CuidadorProfileRepository carers, FamiliaProfileRepository families, ContatoRepository contacts) {
        this.users = users; this.carers = carers; this.families = families; this.contacts = contacts;
    }
    public record PublicCarer(Long id, String nome, String descricao, String curriculoUrl, boolean perfilCompleto) {}
    public record Account(Long id, String nome, String email, String cpf, String role, FamiliaProfileData familia, CuidadorProfileData cuidador) {}
    private PublicCarer publicData(User user, CuidadorProfile p) {
        String nome = p == null ? user.getNome() : (p.getNomeSocial() != null && !p.getNomeSocial().isBlank() ? p.getNomeSocial() : p.getNomeCuidador());
        return new PublicCarer(user.getId(), nome, p == null ? null : p.getDescricao(), p == null ? null : p.getCurriculoUrl(), p != null);
    }
    public List<PublicCarer> listCarers() {
        Map<Long, CuidadorProfile> profiles = new HashMap<>();
        carers.findAll().forEach(p -> profiles.put(p.getUser().getId(), p));
        return users.findAllByRoleOrderByNomeAsc("CUIDADOR").stream().map(u -> publicData(u, profiles.get(u.getId()))).toList();
    }
    public PublicCarer carer(Long id) {
        User user = users.findById(id).filter(u -> "CUIDADOR".equals(u.getRole())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuidador não encontrado."));
        return publicData(user, carers.findByUserId(id).orElse(null));
    }
    public List<Account> accounts() {
        return users.findAll().stream().filter(u -> !"ADMIN".equals(u.getRole())).map(u -> {
            var f = families.findByUserId(u.getId()).map(p -> new FamiliaProfileData(p.getNomePaciente(), p.getDataNascimento(), p.getFinalidade(), p.getAlergias(), p.getRecomendacoes())).orElse(null);
            var c = carers.findByUserId(u.getId()).map(p -> new CuidadorProfileData(p.getNomeCuidador(), p.getNomeSocial(), p.getGenero(), p.getDataNascimento(), p.getDescricao(), p.getCurriculoUrl())).orElse(null);
            return new Account(u.getId(), u.getNome(), u.getEmail(), u.getCpf(), u.getRole(), f, c);
        }).toList();
    }
    @Transactional
    public void delete(Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada."));
        if ("ADMIN".equals(user.getRole())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A conta de administração não pode ser excluída.");
        contacts.deleteForUser(id);
        families.findByUserId(id).ifPresent(families::delete);
        carers.findByUserId(id).ifPresent(carers::delete);
        families.flush(); carers.flush();
        users.delete(user);
    }
}
