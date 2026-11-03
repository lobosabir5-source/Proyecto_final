package com.Golds_Gym.Gimnasio.application.dto;

import java.time.LocalDate;

public record RachaAsistenciaRespuesta(
        int rachaActual,
        boolean asistioHoy,
        LocalDate ultimaAsistencia,
        LocalDate proximoDiaParaContinuar
) {}
