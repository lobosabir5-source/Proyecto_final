package com.Golds_Gym.Gimnasio.config;

import com.Golds_Gym.Gimnasio.application.service.AuthService;
import com.Golds_Gym.Gimnasio.domain.model.Plan;
import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.repository.PlanRepository;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;

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

    @Bean
    public CommandLineRunner sembrarPlanes(PlanRepository planRepository) {
        return args -> {
            if (planRepository.count() > 0) {
                return;
            }
            String horarioCompleto = "Lun-Vie 7:00-22:00 · Sáb 8:00-21:00 · Dom 8:00-13:00";

            planRepository.save(plan("Plan Mañanero", 185, "Acceso de 7:00 AM a 12:00 PM", false, 1, "/planes/mananero.jpg",
                    "Entrena todos los días", "De lunes a domingo", "Incluye todos los servicios"));
            planRepository.save(plan("Plan Ejecutivo", 170, horarioCompleto, false, 2, "/planes/ejecutivo.jpg",
                    "Entrena 3 veces por semana", "Escoge los días de entrenamiento", "Incluye todos los servicios"));
            planRepository.save(plan("Plan Normal", 250, horarioCompleto, true, 3, "/planes/normal.jpg",
                    "Entrena todos los días", "Quédate el tiempo que desees", "Incluye todos los servicios"));
            planRepository.save(plan("Plan Adulto Mayor", 120, "Yoga, Oxígeno, Folklore y Baile Terapia", false, 4, "/planes/adulto-mayor.jpg",
                    "Yoga: Martes 08:00 / Miércoles 17:00",
                    "Oxígeno: Martes y Jueves 16:00",
                    "Folklore: Martes, Jueves 19:00 / Viernes 18:00",
                    "Baile terapia: Lunes, Miércoles, Viernes 16:00"));
            log.info("Planes iniciales creados");
        };
    }

    private Plan plan(String nombre, int precio, String horario, boolean destacado, int orden,
                      String imagen, String... beneficios) {
        Plan plan = new Plan(nombre, null, 30, BigDecimal.valueOf(precio)); // 30 días = 1 mes
        plan.setHorario(horario);
        plan.setBeneficios(String.join("\n", beneficios)); // une los beneficios con saltos de línea
        plan.setDestacado(destacado);
        plan.setOrden(orden);
        plan.setImagenUrl(imagen);
        return plan;
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