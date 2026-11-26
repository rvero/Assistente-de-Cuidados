package com.projeto.cuidadodeidosos.controller;
import com.projeto.cuidadodeidosos.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
public class ContratacaoController {
    private final ContratacaoService service;
    public ContratacaoController(ContratacaoService service) { this.service=service; }
    @PostMapping("/api/cliente/contratos") @ResponseStatus(HttpStatus.CREATED)
    public ContratacaoService.Item solicitar(Authentication a,@Valid @RequestBody AgendaService.AgendamentosRequest r) { return service.solicitar(a.getName(),r); }
    @GetMapping("/api/cliente/contratos/atual")
    public ResponseEntity<ContratacaoService.Item> atual(Authentication a) { var c=service.atual(a.getName()); return c==null?ResponseEntity.noContent().build():ResponseEntity.ok(c); }
    @GetMapping("/api/cliente/contratos")
    public List<ContratacaoService.Item> familia(Authentication a) { return service.listar(a.getName(),"CLIENTE"); }
    @PostMapping("/api/cliente/contratos/{id}/cancelar")
    public ContratacaoService.Item cancelar(Authentication a,@PathVariable("id") Long id) { return service.cancelar(a.getName(),id,"CLIENTE"); }
    @PostMapping("/api/cliente/contratos/{id}/concluir")
    public ContratacaoService.Item concluirFamilia(Authentication a,@PathVariable("id") Long id) { return service.concluir(a.getName(),id,"CLIENTE"); }
    @PostMapping("/api/cuidador/contratos/{id}/concluir")
    public ContratacaoService.Item concluirCuidador(Authentication a,@PathVariable("id") Long id) { return service.concluir(a.getName(),id,"CUIDADOR"); }
    @PostMapping("/api/cuidador/contratos/{id}/cancelar")
    public ContratacaoService.Item cancelarCuidador(Authentication a,@PathVariable("id") Long id) { return service.cancelar(a.getName(),id,"CUIDADOR"); }
    @GetMapping("/api/cuidador/contratos")
    public List<ContratacaoService.Item> cuidador(Authentication a) { return service.listar(a.getName(),"CUIDADOR"); }
    @GetMapping("/api/cuidador/contratos/{id}")
    public ContratacaoService.Detalhe detalhe(Authentication a,@PathVariable("id") Long id) { return service.detalhe(a.getName(),id); }
    @PostMapping("/api/cuidador/contratos/{id}/aceitar")
    public ContratacaoService.Item aceitar(Authentication a,@PathVariable("id") Long id) { return service.responder(a.getName(),id,true); }
    @PostMapping("/api/cuidador/contratos/{id}/recusar")
    public ContratacaoService.Item recusar(Authentication a,@PathVariable("id") Long id) { return service.responder(a.getName(),id,false); }
    @GetMapping("/api/admin/contratos")
    public List<ContratacaoService.Item> admin(Authentication a) { return service.historicoAdmin(a.getName()); }
}
