
package com.Golds_Gym.Gimnasio.application.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventarioProbabilisticoRespuesta {

    private Double demandaDuranteEntrega;
    private Double desviacionDuranteEntrega;
    private Double valorZ;
    private Double stockSeguridad;
    private Integer stockSeguridadUnidades;
    private Double puntoReorden;
    private Integer puntoReordenUnidades;
    private Integer stockActual;
    private Boolean requiereReposicion;
    private String recomendacion;
}
