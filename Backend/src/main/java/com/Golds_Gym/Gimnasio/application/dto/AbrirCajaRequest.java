package com.Golds_Gym.Gimnasio.application.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record AbrirCajaRequest(
        @NotNull @DecimalMin("0.00") BigDecimal montoInicial) {}
