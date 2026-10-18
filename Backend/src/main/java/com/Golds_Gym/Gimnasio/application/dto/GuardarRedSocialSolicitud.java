package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;

public record GuardarRedSocialSolicitud(@NotBlank @Size(max = 70) String plataforma,
        @NotBlank @Size(max = 500) @Pattern(regexp = "https?://.+", message = "URL debe empezar por http:// o https://") String url,
        @Size(max = 255) String nombreUsuario, @Size(max = 255) String icono, boolean activo, @Min(0) int orden) {
}
