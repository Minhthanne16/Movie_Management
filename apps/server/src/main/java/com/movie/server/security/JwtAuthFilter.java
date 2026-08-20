package com.movie.server.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String origin = request.getHeader("Origin");
        log.debug("[JwtAuthFilter] {} {} | Origin: {}", method, uri, origin);

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("[JwtAuthFilter] No Bearer token — passing through for {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        log.debug("[JwtAuthFilter] Token present for {}", uri);

        boolean valid;
        try {
            valid = jwtService.isTokenValid(token);
        } catch (Exception e) {
            log.warn("[JwtAuthFilter] isTokenValid threw {} for {}: {}", e.getClass().getSimpleName(), uri, e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (!valid) {
            log.debug("[JwtAuthFilter] Token invalid — passing through for {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtService.extractEmail(token);
        log.debug("[JwtAuthFilter] Valid token, email={}, uri={}", email, uri);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("[JwtAuthFilter] Auth set for {} | authorities={}", email, userDetails.getAuthorities());
            } catch (Exception e) {
                log.warn("[JwtAuthFilter] loadUserByUsername failed for {}: {}", email, e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
