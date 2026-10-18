
package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Promocion.TipoDescuento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PromocionRespuesta(

        Long id,
        String nombre,
        TipoDescuento tipo,
        BigDecimal valor,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Long planId,
        boolean activo,
        String imagenUrl

) {
}
