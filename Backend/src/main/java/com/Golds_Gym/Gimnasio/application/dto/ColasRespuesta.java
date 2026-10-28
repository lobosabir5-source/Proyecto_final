package com.Golds_Gym.Gimnasio.application.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ColasRespuesta {
    private String modelo;
    private Integer servidores;
    private Integer capacidadSistema;
    private Double probabilidadBloqueo;
    private Double tasaLlegadasEfectiva;
    private Double tasaClientesRechazados;
    private Double utilizacion;
    private Double probabilidadSistemaVacio;
    private Double probabilidadEsperar;
    private Double probabilidadNClientes;
    private Double clientesPromedioCola;
    private Double clientesPromedioSistema;
    private Double tiempoPromedioColaHoras;
    private Double tiempoPromedioSistemaHoras;
    private Double tiempoPromedioColaMinutos;
    private Double tiempoPromedioSistemaMinutos;
}
