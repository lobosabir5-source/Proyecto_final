package com.Golds_Gym.Gimnasio.application.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReposicionStockRespuesta {
    private Integer productoId;
    private String producto;
    private Integer stockAnterior;
    private Integer cantidadAgregada;
    private Integer stockActual;
}
