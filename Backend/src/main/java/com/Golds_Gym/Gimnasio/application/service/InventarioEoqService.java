package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.CalcularEoqRequest;
import com.Golds_Gym.Gimnasio.application.dto.CalcularEoqRespuesta;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventarioEoqService {

    public CalcularEoqRespuesta calcular(CalcularEoqRequest solicitud) {
        double demanda = solicitud.demandaAnual();
        double pedido = solicitud.costoPorPedido();
        double mantenimiento = solicitud.costoMantenimientoAnual();

        if (!Double.isFinite(demanda) || !Double.isFinite(pedido)
                || !Double.isFinite(mantenimiento)
                || demanda <= 0 || pedido <= 0 || mantenimiento <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La demanda y los costos deben ser numeros positivos y finitos");
        }

        double cantidad = Math.sqrt(2.0 * demanda * pedido / mantenimiento);
        if (!Double.isFinite(cantidad) || cantidad > Long.MAX_VALUE - 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los valores exceden el rango admitido para el calculo");
        }

        long unidades = Math.max(1L, Math.round(cantidad));
        double pedidosAnuales = demanda / unidades;
        double diasEntrePedidos = 365.0 / pedidosAnuales;
        double costoPedidos = pedidosAnuales * pedido;
        double costoMantenimiento = unidades * mantenimiento / 2.0;
        double costoTotal = costoPedidos + costoMantenimiento;

        if (!Double.isFinite(costoTotal) || !Double.isFinite(diasEntrePedidos)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los resultados exceden el rango numerico admitido");
        }

        return new CalcularEoqRespuesta(cantidad, unidades, pedidosAnuales,
                diasEntrePedidos, costoPedidos, costoMantenimiento, costoTotal);
    }
}
