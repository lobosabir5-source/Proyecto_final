package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;

public record GuardarTelefonoSolicitud(@NotBlank @Size(max = 40) String numero,
        @Size(max = 255) String etiqueta, boolean whatsapp, boolean principal, boolean activo,
        @Min(0) int orden) {
}
