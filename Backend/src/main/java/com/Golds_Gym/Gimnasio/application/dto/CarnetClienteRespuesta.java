package com.Golds_Gym.Gimnasio.application.dto;
import java.time.LocalDate;
import java.util.List;

public record CarnetClienteRespuesta(
        Long clienteId,
        String nombreCompleto,
        String numeroDocumento,
        String fotoUrl,
        Long membresiaId,
        String plan,
        String estado,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        int permisosUsadosMes,
        int permisosDisponiblesMes,
        List<Boolean> circulosPermisos,
        RachaAsistenciaRespuesta rachaAsistencia) {}
