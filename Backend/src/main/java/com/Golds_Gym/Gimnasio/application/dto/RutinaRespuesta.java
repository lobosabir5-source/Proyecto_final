package com.Golds_Gym.Gimnasio.application.dto;

import java.time.LocalDateTime;

public record RutinaRespuesta(
        Long id,
        Long clienteId,
        String cliente,
        String nombre,
        String contenido,
        LocalDateTime fechaCreacion,
        boolean activa) {
}