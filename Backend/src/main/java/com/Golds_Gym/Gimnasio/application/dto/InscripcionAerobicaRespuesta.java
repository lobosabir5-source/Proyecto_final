package com.Golds_Gym.Gimnasio.application.dto;

import java.time.LocalDateTime;

public record InscripcionAerobicaRespuesta(Long id, Long claseId, Long clienteId, String cliente,
        LocalDateTime fechaInscripcion, LocalDateTime llegadaCliente, Boolean asistio, String estado,
        Integer ordenLlegada) {
}
