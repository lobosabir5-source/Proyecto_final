package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;

public record GuardarSeccionSolicitud(@NotBlank @Size(max = 80) String clave,
        String titulo, @Size(max = 4000) String contenido, String imagenUrl,
        boolean visible, @Min(0) int orden) {
}
