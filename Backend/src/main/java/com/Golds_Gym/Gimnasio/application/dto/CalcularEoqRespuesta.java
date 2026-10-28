package com.Golds_Gym.Gimnasio.application.dto;

public record CalcularEoqRespuesta(
        double cantidadEconomica,
        long cantidadSugeridaUnidades,
        double pedidosPorAnio,
        double diasEntrePedidos,
        double costoAnualPedidos,
        double costoAnualMantenimiento,
        double costoAnualRelevante
) {}
