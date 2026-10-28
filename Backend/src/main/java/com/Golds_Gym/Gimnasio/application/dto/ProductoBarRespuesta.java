package com.Golds_Gym.Gimnasio.application.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProductoBarRespuesta {
    private Integer id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private String imagenUrl;
    private Byte estado;
    private LocalDateTime creadoEn;
    private Integer categoriaId;
    private String categoriaNombre;
}
