package com.projeto.cuidadodeidosos.controller;
import com.projeto.cuidadodeidosos.service.ContactService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
public class ContactController {
    private final ContactService contacts;
    public ContactController(ContactService contacts){this.contacts=contacts;}
    @PostMapping("/api/cuidadores/{id}/contato") public ContactService.ContactResult contact(Authentication auth,@PathVariable Long id){return contacts.contact(auth.getName(),id);}
    @GetMapping("/api/contatos") public List<ContactService.FamilyContact> list(Authentication auth){return contacts.list(auth.getName());}
}
