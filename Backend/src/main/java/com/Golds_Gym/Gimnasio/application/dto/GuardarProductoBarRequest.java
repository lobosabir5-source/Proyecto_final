package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class GuardarProductoBarRequest {
    @NotBlank @Size(max = 100)
    private String nombre;

    @Size(max = 255)
    private String descripcion;

    @NotNull @DecimalMin(value = "0.01") @Digits(integer = 8, fraction = 2)
    private BigDecimal precio;

    @NotNull @Min(0)
    private Integer stock;

    @Size(max = 500)
    private String imagenUrl;

    @NotNull
    private Integer categoriaId;
}
