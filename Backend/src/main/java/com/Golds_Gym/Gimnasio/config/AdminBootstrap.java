package com.Golds_Gym.Gimnasio.config;

import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrap {

    @Bean
    ApplicationRunner crearAdministradorInicial(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username:}") String username,
            @Value("${app.admin.password:}") String password) {
        return args -> {
            if (username.isBlank() && password.isBlank()) {
                return;
            }
            if (username.isBlank() || password.length() < 12) {
                throw new IllegalStateException(
                        "Configura APP_ADMIN_USERNAME y una APP_ADMIN_PASSWORD de al menos 12 caracteres");
            }
            if (!usuarioRepository.existsByUsuario(username.trim())) {
                usuarioRepository.save(new Usuario(
                        username.trim(), passwordEncoder.encode(password), Rol.ADMIN));
            }
        };
    }
}