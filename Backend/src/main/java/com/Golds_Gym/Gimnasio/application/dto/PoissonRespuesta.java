package com.Golds_Gym.Gimnasio.application.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PoissonRespuesta {
    private Double mediaEventos;
    private Integer eventos;
    private Double probabilidadExacta;
    private Double probabilidadCero;
}
