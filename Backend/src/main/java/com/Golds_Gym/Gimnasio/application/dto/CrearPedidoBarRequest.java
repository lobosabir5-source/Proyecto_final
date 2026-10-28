package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class CrearPedidoBarRequest {
    @NotNull private Long usuarioId;
    @NotNull private Integer metodoPagoId;
    @NotEmpty private List<@NotNull @Valid Item> items;

    @Getter @Setter
    public static class Item {
        @NotNull private Integer productoId;
        @NotNull @Min(1) private Integer cantidad;
    }
}
