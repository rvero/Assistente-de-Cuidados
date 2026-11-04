package com.projeto.cuidadodeidosos.controller;
import com.projeto.cuidadodeidosos.service.DirectoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController
@RequestMapping("/api")
public class DirectoryController {
    private final DirectoryService directory;
    public DirectoryController(DirectoryService directory) { this.directory = directory; }
    @GetMapping("/cuidadores") public List<DirectoryService.PublicCarer> carers() { return directory.listCarers(); }
    @GetMapping("/cuidadores/{id}") public DirectoryService.PublicCarer carer(@PathVariable Long id) { return directory.carer(id); }
    @GetMapping("/admin/contas") public List<DirectoryService.Account> accounts() { return directory.accounts(); }
    @DeleteMapping("/admin/contas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { directory.delete(id); }
}
