package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.MantenimientoEquipo;
import java.time.LocalDate;

public record MantenimientoRespuesta(Long id, Long equipoId, Long tecnicoId, LocalDate fechaProgramada,
        LocalDate fechaRealizada,
        MantenimientoEquipo.Estado estado, String trabajoRealizado, String observaciones, boolean vencido) {
    public static MantenimientoRespuesta desde(MantenimientoEquipo m) {
        return new MantenimientoRespuesta(m.getId(), m.getEquipo().getId(),
                m.getTecnico() == null ? null : m.getTecnico().getId(), m.getFechaProgramada(), m.getFechaRealizada(),
                m.getEstado(), m.getTrabajoRealizado(), m.getObservaciones(),
                m.getEstado() == MantenimientoEquipo.Estado.PENDIENTE
                        && m.getFechaProgramada().isBefore(LocalDate.now()));
    }
}
