package com.projeto.cuidadodeidosos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final com.projeto.cuidadodeidosos.repository.UserRepository users;
    public JwtAuthFilter(JwtService jwtService, com.projeto.cuidadodeidosos.repository.UserRepository users) {
        this.users = users;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parse(header.substring(7));
                var user = users.findByEmail(claims.getSubject()).orElse(null);
                if (user == null || !(claims.get("userId") instanceof Number tokenUserId) || user.getId().longValue() != tokenUserId.longValue()) { chain.doFilter(request, response); return; }
                Object versionClaim = claims.get("authVersion");
                int tokenVersion = versionClaim instanceof Number n ? n.intValue() : 0;
                if (tokenVersion != user.getAuthVersion()) { chain.doFilter(request, response); return; }
                String role = user.getRole();
                var auth = new UsernamePasswordAuthenticationToken(
                        claims.getSubject(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException e) {
                // Token inválido ou expirado: segue sem autenticação (resultará em 401)
            }
        }
        chain.doFilter(request, response);
    }
}
