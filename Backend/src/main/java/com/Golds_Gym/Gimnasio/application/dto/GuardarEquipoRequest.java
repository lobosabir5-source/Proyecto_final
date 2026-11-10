package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Equipo;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Getter
@Setter
public class GuardarEquipoRequest {
    @NotBlank
    @Size(max = 40)
    private String codigo;
    @NotBlank
    @Size(max = 120)
    private String nombre;
    @NotBlank
    @Size(max = 60)
    private String tipo;
    @Size(max = 120)
    private String ubicacion;
    @Size(max = 500)
    private String descripcion;
    private Equipo.Estado estado;
    private Boolean mantenimientoActivo;
    private DayOfWeek diaUno;
    private DayOfWeek diaDos;
    private Long tecnicoId;
    private LocalDate fechaAlta;
}
