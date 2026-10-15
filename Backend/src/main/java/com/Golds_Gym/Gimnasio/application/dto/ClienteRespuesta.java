package com.Golds_Gym.Gimnasio.application.dto;

import java.time.LocalDate;

public record ClienteRespuesta(
        Long id,
        Long usuarioId,
        String usuario,
        String nombre,
        String correo,
        String telefono,
        LocalDate fechaNacimiento,
        LocalDate fechaAlta,
        boolean activo) {
}