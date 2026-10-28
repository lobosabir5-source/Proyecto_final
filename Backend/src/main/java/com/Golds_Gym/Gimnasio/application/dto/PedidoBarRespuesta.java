package com.Golds_Gym.Gimnasio.application.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
public class PedidoBarRespuesta {
    private Integer id;
    private Long usuarioId;
    private Integer metodoPagoId;
    private BigDecimal total;
    private Byte estado;
    private Byte estadoPago;
    private LocalDateTime fechaPedido;
    private List<Item> items;

    @Getter @Setter
    public static class Item {
        private Integer productoId;
        private String nombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
