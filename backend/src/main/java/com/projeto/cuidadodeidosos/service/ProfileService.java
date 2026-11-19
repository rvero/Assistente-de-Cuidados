package com.projeto.cuidadodeidosos.service;
import com.projeto.cuidadodeidosos.dto.*;
import com.projeto.cuidadodeidosos.entity.*;
import com.projeto.cuidadodeidosos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class ProfileService {
    private final UserRepository users;
    private final FamiliaProfileRepository familias;
    private final CuidadorProfileRepository cuidadores;
    public ProfileService(UserRepository users, FamiliaProfileRepository familias, CuidadorProfileRepository cuidadores) {
        this.users = users; this.familias = familias; this.cuidadores = cuidadores;
    }
    private User owner(String email, String role) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!role.equals(user.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return user;
    }
    private FamiliaProfileData data(FamiliaProfile p) {
        return new FamiliaProfileData(p.getNomePaciente(), p.getDataNascimento(), p.getFinalidade(), p.getAlergias(), p.getRecomendacoes());
    }
    private CuidadorProfileData data(CuidadorProfile p) {
        return new CuidadorProfileData(p.getNomeCuidador(), p.getNomeSocial(), p.getGenero(), p.getDataNascimento(), p.getDescricao(), p.getCurriculoUrl(), p.getCidade(), p.getValorHora());
    }
    private PatientData patientData(FamiliaProfile p) { return new PatientData(p.getNomePaciente(),p.getFinalidade(),p.getAlergias(),p.getRecomendacoes()); }
    @Transactional(readOnly=true)
    public PatientData paciente(String email) { User user=owner(email,"CLIENTE");return familias.findByUserId(user.getId()).map(this::patientData).orElse(null); }
    @Transactional
    public PatientData salvarPaciente(String email,PatientData d) {
        User user=owner(email,"CLIENTE");FamiliaProfile p=familias.findByUserId(user.getId()).orElseGet(FamiliaProfile::new);
        p.setUser(user);p.setNomePaciente(d.nomePaciente().trim());p.setFinalidade(d.finalidade());p.setAlergias(d.alergias());p.setRecomendacoes(d.recomendacoes());
        return patientData(familias.save(p));
    }
    @Transactional(readOnly = true)
    public FamiliaProfileData familia(String email) {
        User user = owner(email, "CLIENTE");
        return familias.findByUserId(user.getId()).map(this::data).orElse(null);
    }
    @Transactional
    public FamiliaProfileData salvarFamilia(String email, FamiliaProfileData d) {
        User user = owner(email, "CLIENTE");
        FamiliaProfile p = familias.findByUserId(user.getId()).orElseGet(FamiliaProfile::new);
        p.setUser(user); p.setNomePaciente(d.nomePaciente().trim()); p.setDataNascimento(d.dataNascimento());
        p.setFinalidade(d.finalidade()); p.setAlergias(d.alergias()); p.setRecomendacoes(d.recomendacoes());
        return data(familias.save(p));
    }
    @Transactional(readOnly = true)
    public CuidadorProfileData cuidador(String email) {
        User user = owner(email, "CUIDADOR");
        return cuidadores.findByUserId(user.getId()).map(this::data).orElse(null);
    }
    @Transactional
    public CuidadorProfileData salvarCuidador(String email, CuidadorProfileData d) {
        User user = owner(email, "CUIDADOR");
        CuidadorProfile p = cuidadores.findByUserId(user.getId()).orElseGet(CuidadorProfile::new);
        p.setUser(user); p.setNomeCuidador(d.nomeCuidador().trim()); p.setNomeSocial(d.nomeSocial());
        p.setGenero(d.genero()); p.setDataNascimento(d.dataNascimento()); p.setDescricao(d.descricao());
        p.setCurriculoUrl(d.curriculoUrl());
        p.setCidade(d.cidade() == null || d.cidade().isBlank() ? null : d.cidade().trim()); p.setValorHora(d.valorHora());
        return data(cuidadores.save(p));
    }
}

