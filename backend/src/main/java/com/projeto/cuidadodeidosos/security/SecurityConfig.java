package com.projeto.cuidadodeidosos.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import jakarta.servlet.DispatcherType;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService, com.projeto.cuidadodeidosos.repository.UserRepository users) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth
                        // Healthcheck e tratamento interno de erros do Spring (necessário para páginas de erro funcionarem)
                        .requestMatchers("/api/health").permitAll()
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()

                        // Páginas públicas do front-end (views renderizadas) e arquivos estáticos (JS/CSS/assets)
                        .requestMatchers("/", "/index.html", "/inicio", "/login", "/cadastro", "/perfil",
                                "/home-cliente", "/home-cuidador", "/busca", "/cuidadores/*", "/admin",
                                "/historico", "/agenda", "/contrato", "/contratar/*", "/solicitacoes/*",
                                "/admin/contratos", "/contatos", "/opcoes", "/opcoes/conta",
                                "/opcoes/paciente", "/contatos/*", "/*.js", "/*.css", "/assets/**",
                                "/favicon.ico").permitAll()

                        // Endpoints de autenticação (login/cadastro) — precisam ser públicos para o usuário conseguir logar
                        .requestMatchers("/auth/**", "/api/auth/**").permitAll()

                        // Áreas restritas por papel (role) do usuário autenticado
                        .requestMatchers("/cuidador/**", "/api/cuidador/**").hasRole("CUIDADOR")
                        .requestMatchers("/cliente/**", "/api/cliente/**").hasRole("CLIENTE")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/conta", "/api/conta/**").hasAnyRole("CLIENTE", "CUIDADOR")

                        // Regra específica: somente CLIENTE pode iniciar contato com um cuidador (POST)
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/cuidadores/*/contato").hasRole("CLIENTE")

                        // Cuidador gerencia os contatos que recebeu
                        .requestMatchers("/api/contatos", "/api/contatos/**").hasRole("CUIDADOR")

                        // Fallback de segurança: qualquer rota não listada acima exige autenticação
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(jwtService, users), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Libera o front-end a chamar a API. Ajuste as portas/URL do front aqui.
    @Bean
    CorsConfigurationSource corsConfigurationSource(@org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:4200,http://localhost:8100,http://localhost,https://localhost,capacitor://localhost}") String origins) {
        CorsConfiguration config = new CorsConfiguration();
        var allowed=java.util.Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
        if(allowed.isEmpty() || allowed.stream().anyMatch(s -> s.contains("*"))) throw new IllegalArgumentException("Informe os domínios exatos em CORS_ALLOWED_ORIGINS.");
        config.setAllowedOrigins(allowed);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}