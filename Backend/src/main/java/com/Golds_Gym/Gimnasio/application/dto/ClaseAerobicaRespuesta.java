package com.Golds_Gym.Gimnasio.application.dto;

import java.time.*;

public record ClaseAerobicaRespuesta(
    Long id, 
    String nombre, 
    String descripcion, 
    Long instructorId, 
    String instructor,
    LocalDate fecha, 
    LocalTime horaInicio, 
    LocalTime horaFin, 
    Integer cupoMaximo, 
    long inscritos,
    long cuposDisponibles, 
    String estado, 
    LocalDateTime llegadaInstructor,
    Long minutosRetrasoInstructor) {
}
