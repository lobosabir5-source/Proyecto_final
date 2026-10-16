package com.Golds_Gym.Gimnasio.application.dto;
import java.time.*;
import java.math.BigDecimal;
public record HistorialMembresiaRespuesta(
        Long id,
        Long membresiaId,
        LocalDate fechaAnterior,
        LocalDate fechaNueva,
        BigDecimal precioAplicado,
        LocalDateTime fechaOperacion,
        String operacion) {}
