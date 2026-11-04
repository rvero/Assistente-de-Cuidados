package com.projeto.cuidadodeidosos;
import com.projeto.cuidadodeidosos.entity.User;
import com.projeto.cuidadodeidosos.repository.UserRepository;
import com.projeto.cuidadodeidosos.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.net.URI;
import java.net.http.*;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProfileIntegrationTests {
    @Value("${local.server.port}") int port;
    @Autowired UserRepository users;
    @Autowired JwtService jwt;
    private String account(String role) {
        User u = new User();
        u.setNome("Teste"); u.setEmail(UUID.randomUUID() + "@example.test");
        u.setPassword("unused-in-token-tests"); u.setRole(role);
        return jwt.generateToken(users.save(u));
    }
    private HttpResponse<String> call(String method, String path, String token, String body) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (token != null) request.header("Authorization", "Bearer " + token);
        request.header("Content-Type", "application/json");
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        return HttpClient.newHttpClient().send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
    private final String family = """
        {"nomePaciente":"Paciente ficticio","dataNascimento":"1950-01-01","finalidade":"assistencia_incapaz","alergias":"Nenhuma informada","recomendacoes":"Dados de teste"}
        """;
    private final String carer = """
        {"nomeCuidador":"Cuidador ficticio","nomeSocial":"","genero":"masculino","dataNascimento":"1985-01-01","descricao":"Experiencia ficticia","curriculoUrl":"https://example.com/curriculo"}
        """;
    @Test void registrationRequiresValidUniqueCpfForBothRoles() throws Exception {
        String template = "{\"nome\":\"Teste CPF\",\"email\":\"%s\",\"password\":\"123456\",\"tipo\":\"%s\",\"cpf\":\"%s\"}";
        String[] roles = {"CLIENTE", "CUIDADOR"};
        String[] cpfs = {"529.982.247-25", "11144477735"};
        for (int i = 0; i < roles.length; i++) {
            String email = UUID.randomUUID() + "@example.test";
            assertEquals(400, call("POST", "/api/auth/register", null, template.formatted(email, roles[i], "")).statusCode());
            assertEquals(400, call("POST", "/api/auth/register", null, template.formatted(email, roles[i], "11111111111")).statusCode());
            assertEquals(400, call("POST", "/api/auth/register", null, template.formatted(email, roles[i], "52998224726")).statusCode());
            assertEquals(201, call("POST", "/api/auth/register", null, template.formatted(email, roles[i], cpfs[i])).statusCode());
            assertEquals(cpfs[i].replaceAll("[^0-9]", ""), users.findByEmail(email).orElseThrow().getCpf());
            assertEquals(409, call("POST", "/api/auth/register", null, template.formatted(UUID.randomUUID() + "@example.test", roles[i], cpfs[i].replaceAll("[^0-9]", ""))).statusCode());
            assertEquals(200, call("POST", "/api/auth/login", null, "{\"email\":\"" + email + "\",\"password\":\"123456\"}").statusCode());
        }
    }
    @Test void directoryAndAdminRespectPermissionsAndDeletion() throws Exception {
        String carerToken = account("CUIDADOR");
        String familyToken = account("CLIENTE");
        String adminToken = account("ADMIN");
        String email = jwt.parse(carerToken).getSubject();
        Long id = users.findByEmail(email).orElseThrow().getId();
        assertEquals(401, call("GET", "/api/cuidadores", null, null).statusCode());
        var listing = call("GET", "/api/cuidadores", familyToken, null);
        assertEquals(200, listing.statusCode());
        assertTrue(listing.body().contains("\"id\":" + id));
        assertFalse(listing.body().contains(email));
        assertFalse(listing.body().contains("cpf"));
        assertEquals(200, call("PUT", "/api/cuidador/perfil", carerToken, carer).statusCode());
        assertTrue(call("GET", "/api/cuidadores/" + id, familyToken, null).body().contains("Cuidador ficticio"));
        assertEquals(403, call("GET", "/api/admin/contas", familyToken, null).statusCode());
        assertEquals(403, call("DELETE", "/api/admin/contas/" + id, carerToken, null).statusCode());
        var adminList = call("GET", "/api/admin/contas", adminToken, null);
        assertEquals(200, adminList.statusCode());
        assertTrue(adminList.body().contains(email));
        assertFalse(adminList.body().contains("password"));
        assertEquals(204, call("DELETE", "/api/admin/contas/" + id, adminToken, null).statusCode());
        assertFalse(users.existsById(id));
        assertEquals(404, call("GET", "/api/cuidadores/" + id, familyToken, null).statusCode());
        assertEquals(401, call("GET", "/api/cuidadores", carerToken, null).statusCode());
        User replacement = new User();
        replacement.setNome("Nova conta"); replacement.setEmail(email); replacement.setPassword("unused"); replacement.setRole("CUIDADOR");
        users.save(replacement);
        assertEquals(401, call("GET", "/api/cuidadores", carerToken, null).statusCode());
        Long adminId = users.findByEmail(jwt.parse(adminToken).getSubject()).orElseThrow().getId();
        assertEquals(400, call("DELETE", "/api/admin/contas/" + adminId, adminToken, null).statusCode());
    }
    @Autowired org.springframework.security.crypto.password.PasswordEncoder passwords;
    private String passwordAccount(String role) {
        User u = new User(); u.setNome("Conta para editar"); u.setEmail(UUID.randomUUID() + "@example.test");
        u.setPassword(passwords.encode("senha123")); u.setRole(role);
        return jwt.generateToken(users.save(u));
    }
    @Test void ownAccountCanBeEditedAndDeletedWithPasswordConfirmation() throws Exception {
        String token = passwordAccount("CLIENTE");
        String email = UUID.randomUUID() + "@example.test";
        String data = "{\"nome\":\"Nome atualizado\",\"email\":\"" + email + "\",\"cpf\":\"93541134780\",\"senhaAtual\":\"senha123\",\"novaSenha\":\"nova1234\"}";
        assertEquals(200, call("GET", "/api/conta", token, null).statusCode());
        assertEquals(400, call("PUT", "/api/conta", token, data.replace("senha123", "errada")).statusCode());
        assertEquals(400, call("PUT", "/api/conta", token, data.replace("93541134780", "11111111111")).statusCode());
        var updated = call("PUT", "/api/conta", token, data);
        assertEquals(200, updated.statusCode());
        assertFalse(updated.body().contains("password"));
        assertEquals(401, call("GET", "/api/conta", token, null).statusCode());
        String newToken = jwt.generateToken(users.findByEmail(email).orElseThrow());
        assertTrue(call("GET", "/api/conta", newToken, null).body().contains("Nome atualizado"));
        assertEquals(200, call("POST", "/api/auth/login", null, "{\"email\":\"" + email + "\",\"password\":\"nova1234\"}").statusCode());
        assertEquals(400, call("DELETE", "/api/conta", newToken, "{\"senhaAtual\":\"errada\"}").statusCode());
        assertEquals(204, call("DELETE", "/api/conta", newToken, "{\"senhaAtual\":\"nova1234\"}").statusCode());
        assertEquals(401, call("GET", "/api/conta", newToken, null).statusCode());
    }
    @Test void passwordChangeRevokesPreviousSessionsEvenWithSameEmail() throws Exception {
        String token=passwordAccount("CUIDADOR");String email=jwt.parse(token).getSubject();
        String data="{\"nome\":\"Conta teste\",\"email\":\""+email+"\",\"cpf\":\"39053344705\",\"senhaAtual\":\"senha123\",\"novaSenha\":\"outra123\"}";
        assertEquals(200,call("PUT","/api/conta",token,data).statusCode());
        assertEquals(401,call("GET","/api/conta",token,null).statusCode());
        assertEquals(200,call("GET","/api/conta",jwt.generateToken(users.findByEmail(email).orElseThrow()),null).statusCode());
    }
    @Test void caregiverAccountAndProfessionalProfileAreSavedAtomically() throws Exception {
        String token=passwordAccount("CUIDADOR");String oldEmail=jwt.parse(token).getSubject();String email=UUID.randomUUID()+"@example.test";
        String account="{\"nome\":\"Dados privados atualizados\",\"email\":\""+email+"\",\"cpf\":\"16899535009\",\"senhaAtual\":\"senha123\"}";
        String body="{\"conta\":"+account+",\"perfil\":"+carer+"}";
        assertEquals(400,call("PUT","/api/conta/perfil-cuidador",token,body.replace("senha123","incorreta")).statusCode());
        assertEquals(204,call("GET","/api/cuidador/perfil",token,null).statusCode());
        assertEquals(400,call("PUT","/api/conta/perfil-cuidador",token,body.replace("1985-01-01","2999-01-01")).statusCode());
        assertTrue(users.findByEmail(oldEmail).isPresent());
        assertEquals(200,call("PUT","/api/conta/perfil-cuidador",token,body).statusCode());
        User user=users.findByEmail(email).orElseThrow();String updatedToken=jwt.generateToken(user);
        assertEquals(401,call("GET","/api/conta",token,null).statusCode());
        assertTrue(call("GET","/api/cuidador/perfil",updatedToken,null).body().contains("Cuidador ficticio"));
        String publicData=call("GET","/api/cuidadores/"+user.getId(),updatedToken,null).body();
        assertTrue(publicData.contains("Cuidador ficticio"));assertFalse(publicData.contains("cpf"));assertFalse(publicData.contains("dataNascimento"));assertFalse(publicData.contains(email));
        assertEquals(403,call("PUT","/api/conta/perfil-cuidador",passwordAccount("CLIENTE"),body).statusCode());
    }
    @Test void contactsBelongOnlyToTheChosenCarerAndAreRemovedWithAccount() throws Exception {
        String familyToken = passwordAccount("CLIENTE"); String carerToken = passwordAccount("CUIDADOR");
        Long carerId = users.findByEmail(jwt.parse(carerToken).getSubject()).orElseThrow().getId();
        String endpoint = "/api/cuidadores/" + carerId + "/contato";
        assertEquals(403, call("POST", endpoint, carerToken, "{}").statusCode());
        assertEquals(200, call("POST", endpoint, familyToken, "{}").statusCode());
        assertEquals(200, call("POST", endpoint, familyToken, "{}").statusCode());
        var list = call("GET", "/api/contatos", carerToken, null);
        assertEquals(200, list.statusCode()); assertTrue(list.body().contains(jwt.parse(familyToken).getSubject()));
        assertEquals("[]", call("GET", "/api/contatos", account("CUIDADOR"), null).body());
        assertEquals(403, call("GET", "/api/contatos", familyToken, null).statusCode());
        assertEquals(204, call("DELETE", "/api/conta", familyToken, "{\"senhaAtual\":\"senha123\"}").statusCode());
        assertEquals("[]", call("GET", "/api/contatos", carerToken, null).body());
    }
    @Test void familyCanCreateReadAndUpdateOwnProfile() throws Exception {
        String token = account("CLIENTE");
        assertEquals(204, call("GET", "/api/cliente/perfil", token, null).statusCode());
        assertEquals(200, call("PUT", "/api/cliente/perfil", token, family).statusCode());
        var saved = call("GET", "/api/cliente/perfil", token, null);
        assertEquals(200, saved.statusCode());
        assertTrue(saved.body().contains("Paciente ficticio"));
        assertFalse(saved.body().contains("password"));
        assertEquals(200, call("PUT", "/api/cliente/perfil", token, family.replace("Paciente ficticio", "Paciente atualizado")).statusCode());
        assertTrue(call("GET", "/api/cliente/perfil", token, null).body().contains("Paciente atualizado"));
        assertEquals(204, call("GET", "/api/cliente/perfil?userId=1", account("CLIENTE"), null).statusCode());
    }
    @Test void carerProfileValidatesDateAndCurriculumUrl() throws Exception {
        String token = account("CUIDADOR");
        assertEquals(200, call("PUT", "/api/cuidador/perfil", token, carer).statusCode());
        assertTrue(call("GET", "/api/cuidador/perfil", token, null).body().contains("Cuidador ficticio"));
        assertEquals(400, call("PUT", "/api/cuidador/perfil", token, carer.replace("1985-01-01", "2999-01-01")).statusCode());
        assertEquals(400, call("PUT", "/api/cuidador/perfil", token, carer.replace("https://example.com/curriculo", "javascript:alert(1)")).statusCode());
        assertTrue(call("GET", "/api/cuidador/perfil", token, null).body().contains("1985-01-01"));
    }
    @Test void profilesRequireAuthenticationAndCorrectRole() throws Exception {
        assertEquals(401, call("GET", "/api/cliente/perfil", null, null).statusCode());
        assertEquals(401, call("PUT", "/api/cuidador/perfil", null, carer).statusCode());
        assertEquals(403, call("GET", "/api/cliente/perfil", account("CUIDADOR"), null).statusCode());
        assertEquals(403, call("PUT", "/api/cuidador/perfil", account("CLIENTE"), carer).statusCode());
    }
    @Test void invalidFamilyDataDoesNotCreateProfile() throws Exception {
        String token = account("CLIENTE");
        assertEquals(400, call("PUT", "/api/cliente/perfil", token, family.replace("Paciente ficticio", " ")).statusCode());
        assertEquals(400, call("PUT", "/api/cliente/perfil", token, family.replace("assistencia_incapaz", "invalido")).statusCode());
        assertEquals(204, call("GET", "/api/cliente/perfil", token, null).statusCode());
    }
}

