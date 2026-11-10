package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Equipo;
import java.time.DayOfWeek;
import java.time.LocalDate;

public record EquipoRespuesta(Long id, String codigo, String nombre, String tipo, String ubicacion, String descripcion,
        Equipo.Estado estado, Boolean mantenimientoActivo, DayOfWeek diaUno, DayOfWeek diaDos, Long tecnicoId,
        LocalDate fechaAlta) {
    public static EquipoRespuesta desde(Equipo e) {
        return new EquipoRespuesta(e.getId(), e.getCodigo(), e.getNombre(), e.getTipo(), e.getUbicacion(),
                e.getDescripcion(), e.getEstado(), e.getMantenimientoActivo(), e.getDiaUno(), e.getDiaDos(),
                e.getTecnico() == null ? null : e.getTecnico().getId(), e.getFechaAlta());
    }
}
