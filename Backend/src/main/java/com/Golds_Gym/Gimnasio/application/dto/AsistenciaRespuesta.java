package com.Golds_Gym.Gimnasio.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AsistenciaRespuesta(
        Long id,
        Long clienteId,
        String cliente,
        LocalDate fecha,
        LocalDateTime horaEntrada,
        String registradaPor) {
}