package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.AsistenciaPersonal;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.*;

@Getter
@Setter
public class GuardarAsistenciaPersonalRequest {
    @NotNull
    private Long personalId;
    @NotNull
    private LocalDate fecha;
    @NotNull
    private AsistenciaPersonal.Turno turno;
    @NotNull
    private AsistenciaPersonal.Estado estado;
    private LocalTime horaEntrada;
    private LocalTime horaSalida;
    @Size(max = 500)
    private String observaciones;
}
