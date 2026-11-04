package com.Golds_Gym.Gimnasio.application.dto;
import com.Golds_Gym.Gimnasio.domain.model.MetodoPago;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record MovimientoCajaRequest(
        @NotBlank String tipo,
        @NotNull MetodoPago metodo,
        @NotNull @DecimalMin("0.01") BigDecimal monto,
        @NotBlank String concepto) {}
