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
@Table(name = "pedidos_bar_detalle")
public class PedidoBarDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpedidos_bar_detalle")
    private Integer id;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", nullable = true, precision = 10, scale = 2, insertable = false, updatable = false)
    private BigDecimal subtotal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idpedidos_bar", nullable = false)
    private PedidoBar pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idproductos_bar", nullable = false)
    private ProductoBar producto;
}
