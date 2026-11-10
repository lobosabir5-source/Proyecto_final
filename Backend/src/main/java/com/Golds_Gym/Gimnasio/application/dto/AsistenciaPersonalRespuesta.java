package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.AsistenciaPersonal;
import java.time.*;

public record AsistenciaPersonalRespuesta(Long id, Long personalId, String nombreCompleto, String cargo,
        LocalDate fecha, AsistenciaPersonal.Turno turno, AsistenciaPersonal.Estado estado, LocalTime horaEntrada,
        LocalTime horaSalida, String observaciones, LocalDateTime registradoEn, LocalDateTime actualizadoEn) {
    public static AsistenciaPersonalRespuesta desde(AsistenciaPersonal a) {
        return new AsistenciaPersonalRespuesta(a.getId(), a.getPersonal().getId(),
                a.getPersonal().getNombres() + " " + a.getPersonal().getApellidos(), a.getPersonal().getCargo().name(),
                a.getFecha(), a.getTurno(), a.getEstado(), a.getHoraEntrada(), a.getHoraSalida(), a.getObservaciones(),
                a.getRegistradoEn(), a.getActualizadoEn());
    }
}
