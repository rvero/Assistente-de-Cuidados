package com.projeto.cuidadodeidosos.service;
import com.projeto.cuidadodeidosos.entity.*;
import com.projeto.cuidadodeidosos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.List;
@Service
public class ContactService {
    private final UserRepository users;private final ContatoRepository contacts;private final FamiliaProfileRepository families;
    public ContactService(UserRepository users,ContatoRepository contacts,FamiliaProfileRepository families){this.users=users;this.contacts=contacts;this.families=families;}
    private User owner(String email,String role){User u=users.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));if(!role.equals(u.getRole()))throw new ResponseStatusException(HttpStatus.FORBIDDEN);return u;}
    public record ContactResult(String email) {}
    public record FamilyContact(Long id,String nome,String email,Instant criadoEm) {}
    @Transactional
    public ContactResult contact(String email,Long id){User family=owner(email,"CLIENTE");User carer=users.findById(id).filter(u->"CUIDADOR".equals(u.getRole())).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Cuidador não encontrado."));
        if(contacts.findByFamiliaIdAndCuidadorId(family.getId(),id).isEmpty()){Contato c=new Contato();c.setFamilia(family);c.setCuidador(carer);contacts.save(c);}
        return new ContactResult(carer.getEmail());
    }
    public record ContactDetails(String nome,String email,com.projeto.cuidadodeidosos.dto.PatientData paciente) {}
    @Transactional(readOnly=true)
    public ContactDetails detail(String email,Long id) {
        User carer=owner(email,"CUIDADOR");Contato c=contacts.findById(id).filter(x->x.getCuidador().getId().equals(carer.getId())).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contato não encontrado."));
        var patient=families.findByUserId(c.getFamilia().getId()).map(p->new com.projeto.cuidadodeidosos.dto.PatientData(p.getNomePaciente(),p.getFinalidade(),p.getAlergias(),p.getRecomendacoes())).orElse(null);
        return new ContactDetails(c.getFamilia().getNome(),c.getFamilia().getEmail(),patient);
    }
    @Transactional(readOnly=true)
    public List<FamilyContact> list(String email){User carer=owner(email,"CUIDADOR");return contacts.findByCuidadorIdOrderByCriadoEmDesc(carer.getId()).stream().map(c->new FamilyContact(c.getId(),c.getFamilia().getNome(),c.getFamilia().getEmail(),c.getCriadoEm())).toList();}
}
