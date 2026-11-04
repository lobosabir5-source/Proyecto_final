package com.Golds_Gym.Gimnasio.application.dto;
import java.math.BigDecimal;
public record CajaResumenRespuesta(
        Long cajaId,
        String estado,
        BigDecimal montoInicial,
        BigDecimal ingresosEfectivo,
        BigDecimal ingresosQr,
        BigDecimal egresosEfectivo,
        BigDecimal egresosQr,
        BigDecimal efectivoEsperado,
        BigDecimal efectivoContado,
        BigDecimal diferencia) {}
