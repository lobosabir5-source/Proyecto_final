package com.Golds_Gym.Gimnasio.application.dto;
import jakarta.validation.constraints.*;
import java.time.LocalTime;
public record GuardarHorarioSolicitud(@NotNull @Min(1) @Max(7) Integer diaSemana,
 LocalTime apertura,LocalTime cierre,boolean cerrado) {}
