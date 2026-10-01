package com.meetspace.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.*;
import java.util.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        var csrf = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrf.setCookieCustomizer(c -> c.sameSite("Lax").path("/"));
        return http
            .cors(c -> c.configurationSource(corsConfigurationSource))
            .csrf(c -> c
                .csrfTokenRepository(csrf)
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/verify-email", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/rooms", "/api/rooms/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .build();
    }

    @Bean(name = "corsConfigurationSource")
    CorsConfigurationSource corsConfigurationSource(@Value("${meetspace.security.cors-allowed-origin}") String origin) {
        var c = new CorsConfiguration();
        var origins = Arrays.stream(origin.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
        c.setAllowedOrigins(origins);
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("Set-Cookie", "X-XSRF-TOKEN"));
        c.setMaxAge(3600L);
        c.setAllowCredentials(true);
        var s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}