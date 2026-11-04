package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Personal;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class GuardarPersonalRequest {
    @NotBlank
    @Size(max = 100)
    private String nombres;
    @NotBlank
    @Size(max = 100)
    private String apellidos;
    @NotBlank
    @Size(max = 30)
    private String documento;
    @Size(max = 30)
    private String telefono;
    @Email
    @Size(max = 150)
    private String correo;
    @NotNull
    private Personal.Cargo cargo;
    @NotNull
    private LocalDate fechaIngreso;
    @Size(max = 500)
    private String observaciones;
}
