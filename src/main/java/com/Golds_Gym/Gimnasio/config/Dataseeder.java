package com.Golds_Gym.Gimnasio.config;

import com.Golds_Gym.Gimnasio.application.service.AuthService;
import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class Dataseeder {

    private static final Logger log = LoggerFactory.getLogger(Dataseeder.class);

    @Bean
    public CommandLineRunner sembrarUsuarios(AuthService authService, UsuarioRepository usuarioRepository) {
        return args -> {
            crearSiNoExiste(authService, usuarioRepository, "admin", "Admin1234", Rol.ADMIN);
            crearSiNoExiste(authService, usuarioRepository, "recepcionista", "Recep1234", Rol.RECEPCIONISTA);
            crearSiNoExiste(authService, usuarioRepository, "cliente", "Cliente1234", Rol.CLIENTE);
        };
    }

    private void crearSiNoExiste(AuthService authService, UsuarioRepository usuarioRepository,
                                 String usuario, String password, Rol rol) {
        if (!usuarioRepository.existsByUsuario(usuario)) {
            authService.crearUsuario(usuario, password, rol);
            log.info("Usuario '{}' creado con rol {}", usuario, rol);
        } else {
            log.info("El usuario '{}' ya existe, no se crea de nuevo", usuario);
        }
    }
}