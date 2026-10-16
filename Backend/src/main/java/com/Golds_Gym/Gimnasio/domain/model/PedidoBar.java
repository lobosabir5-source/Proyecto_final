package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pedidos_bar")
public class PedidoBar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpedidos_bar")
    private Integer id;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "estado", nullable = false)
    private Byte estado;

    @Column(name = "estado_pago", nullable = false)
    private Byte estadoPago;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;

    @Column(name = "fecha_entrega", nullable = true)
    private LocalDateTime fechaEntrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idcarrito", nullable = true)
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idmetodos_pago", nullable = false)
    private MetodoPagoEntidad metodoPago;
}
