package com.Golds_Gym.Gimnasio.config;

import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner inicializarUsuarios(UsuarioRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (!repo.existsByUsuario("admin")) {
                repo.save(new Usuario("admin", encoder.encode("admin1234"), Rol.ADMIN));
                System.out.println(">>> Usuario ADMIN creado: admin / admin1234");
            }
            if (!repo.existsByUsuario("recepcion")) {
                repo.save(new Usuario("recepcion", encoder.encode("recepcion123"), Rol.RECEPCIONISTA));
                System.out.println(">>> Usuario RECEPCIONISTA creado: recepcion / recepcion123");
            }
            if (!repo.existsByUsuario("cliente")) {
                repo.save(new Usuario("cliente", encoder.encode("cliente123"), Rol.CLIENTE));
                System.out.println(">>> Usuario CLIENTE creado: cliente / cliente123");
            }
        };
    }
}