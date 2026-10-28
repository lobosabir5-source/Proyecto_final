package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuardarCategoriaBarRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 60)
    private String nombre;

    @Size(max = 255)
    private String descripcion;
}
