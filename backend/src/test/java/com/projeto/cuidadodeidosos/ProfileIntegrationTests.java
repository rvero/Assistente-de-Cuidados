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

