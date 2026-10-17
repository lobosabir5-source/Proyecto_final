package com.Golds_Gym.Gimnasio.tarea;

import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import com.Golds_Gym.Gimnasio.domain.model.*;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Component
public class ActualizacionEstadoMembresia {
    private final MembresiaRepository repositorio;

    public ActualizacionEstadoMembresia(MembresiaRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "America/La_Paz")
    @Transactional
    public void actualizar() {
        LocalDate hoy = LocalDate.now(java.time.ZoneId.of("America/La_Paz"));
        for (Membresia m : repositorio.findAll()) {
            if (m.getEstado() == EstadoMembresia.CANCELADA || m.getEstado() == EstadoMembresia.PENDIENTE)
                continue;
            if (m.getFechaFin().isBefore(hoy))
                m.setEstado(EstadoMembresia.VENCIDA);
            else if (!m.getFechaInicio().isAfter(hoy))
                m.setEstado(!m.getFechaFin().isAfter(hoy.plusDays(7)) ? EstadoMembresia.POR_VENCER
                        : EstadoMembresia.ACTIVA);
        }
    }
}
