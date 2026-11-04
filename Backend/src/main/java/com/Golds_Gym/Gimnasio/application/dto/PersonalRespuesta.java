package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Personal;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class PersonalRespuesta {
    private Long id;
    private String nombres, apellidos, documento, telefono, correo, observaciones;
    private Personal.Cargo cargo;
    private Personal.EstadoLaboral estadoLaboral;
    private LocalDate fechaIngreso, fechaSalida;

    public static PersonalRespuesta desde(Personal p) {
        PersonalRespuesta r = new PersonalRespuesta();
        r.id = p.getId();
        r.nombres = p.getNombres();
        r.apellidos = p.getApellidos();
        r.documento = p.getDocumento();
        r.telefono = p.getTelefono();
        r.correo = p.getCorreo();
        r.cargo = p.getCargo();
        r.estadoLaboral = p.getEstadoLaboral();
        r.fechaIngreso = p.getFechaIngreso();
        r.fechaSalida = p.getFechaSalida();
        r.observaciones = p.getObservaciones();
        return r;
    }
}
