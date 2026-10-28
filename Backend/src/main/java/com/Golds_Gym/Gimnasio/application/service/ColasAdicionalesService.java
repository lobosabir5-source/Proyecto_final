package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ColasAdicionalesService {

    public ColasRespuesta calcularInfinita(ColaInfinitaRequest request) {
        double lambda = request.getTasaLlegadas();
        double mu = request.getTasaServicio();
        int n = request.getClientes();
        validarPositivo(lambda, "tasaLlegadas");
        validarPositivo(mu, "tasaServicio");
        double a = lambda / mu;
        if (!Double.isFinite(a) || a > 700) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La relación lambda/mu debe ser finita y no superar 700");
        }
        double pn = poissonExacta(a, n);
        double p0 = Math.exp(-a);
        double ws = 1.0 / mu;
        if (!Double.isFinite(ws) || !Double.isFinite(ws * 60)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiempo fuera de rango");
        }

        ColasRespuesta respuesta = new ColasRespuesta();
        respuesta.setModelo("M/M/infinito");
        respuesta.setProbabilidadSistemaVacio(p0);
        respuesta.setProbabilidadNClientes(pn);
        respuesta.setProbabilidadEsperar(0.0);
        respuesta.setProbabilidadBloqueo(0.0);
        respuesta.setTasaLlegadasEfectiva(lambda);
        respuesta.setTasaClientesRechazados(0.0);
        respuesta.setClientesPromedioCola(0.0);
        respuesta.setClientesPromedioSistema(a);
        respuesta.setTiempoPromedioColaHoras(0.0);
        respuesta.setTiempoPromedioSistemaHoras(ws);
        respuesta.setTiempoPromedioColaMinutos(0.0);
        respuesta.setTiempoPromedioSistemaMinutos(ws * 60);
        // Utilización por servidor y número de servidores no aplican con infinitos servidores.
        return respuesta;
    }

    public PoissonRespuesta calcularPoisson(PoissonRequest request) {
        double lambda = request.getTasaLlegadas();
        double tiempo = request.getTiempoHoras();
        int n = request.getEventos();
        validarPositivo(lambda, "tasaLlegadas");
        validarPositivo(tiempo, "tiempoHoras");
        double media = lambda * tiempo;
        if (!Double.isFinite(media) || media > 700) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La media lambda*tiempo debe ser finita y no superar 700");
        }
        PoissonRespuesta respuesta = new PoissonRespuesta();
        respuesta.setMediaEventos(media);
        respuesta.setEventos(n);
        respuesta.setProbabilidadExacta(poissonExacta(media, n));
        respuesta.setProbabilidadCero(Math.exp(-media));
        return respuesta;
    }

    private void validarPositivo(double valor, String campo) {
        if (!Double.isFinite(valor) || valor <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    campo + " debe ser positivo y finito");
        }
    }

    private double poissonExacta(double media, int n) {
        double logFactorial = 0.0;
        for (int i = 2; i <= n; i++) logFactorial += Math.log(i);
        return Math.exp(-media + n * Math.log(media) - logFactorial);
    }
}
