package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.ColasRequest;
import com.Golds_Gym.Gimnasio.application.dto.ColasRespuesta;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ColasService {
    public ColasRespuesta calcular(ColasRequest request) {
        double lambda = request.getTasaLlegadas();
        double mu = request.getTasaServicio();
        int c = request.getServidores();
        int n = request.getClientes();

        if (request.getCapacidadSistema() != null) {
            return calcularCapacidadLimitada(request, lambda, mu, c, n);
        }

        if (!Double.isFinite(lambda) || !Double.isFinite(mu)
                || lambda <= 0 || mu <= 0 || lambda >= c * mu) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Las tasas deben ser positivas y finitas; se requiere lambda < servidores * mu");
        }

        double a = lambda / mu;
        double rho = a / c;
        // Suma estable de a^k/k! para k=0..c-1.
        double termino = 1.0;
        double suma = 1.0;
        for (int k = 1; k < c; k++) {
            termino *= a / k;
            suma += termino;
        }
        double terminoC = termino * a / c; // a^c / c!
        double p0 = 1.0 / (suma + terminoC / (1.0 - rho));
        double esperar = terminoC * p0 / (1.0 - rho); // Erlang C
        double lq = esperar * rho / (1.0 - rho);
        double ls = lq + a;
        double wq = lq / lambda;
        double ws = ls / lambda;

        // P(N=n) usando productos sucesivos para evitar factoriales.
        double pn = p0;
        for (int k = 1; k <= n; k++) {
            pn *= a / Math.min(k, c);
        }

        if (!Double.isFinite(lq) || !Double.isFinite(ls)
                || !Double.isFinite(wq) || !Double.isFinite(ws)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los parámetros generan resultados fuera del rango numérico");
        }

        ColasRespuesta respuesta = new ColasRespuesta();
        respuesta.setModelo(c == 1 ? "M/M/1" : "M/M/" + c);
        respuesta.setServidores(c);
        respuesta.setUtilizacion(rho);
        respuesta.setProbabilidadSistemaVacio(p0);
        respuesta.setProbabilidadEsperar(esperar);
        respuesta.setProbabilidadNClientes(pn);
        respuesta.setClientesPromedioCola(lq);
        respuesta.setClientesPromedioSistema(ls);
        respuesta.setTiempoPromedioColaHoras(wq);
        respuesta.setTiempoPromedioSistemaHoras(ws);
        respuesta.setTiempoPromedioColaMinutos(wq * 60);
        respuesta.setTiempoPromedioSistemaMinutos(ws * 60);
        return respuesta;
    }

    /** Modelo M/M/c/K: K incluye clientes en servicio y en espera. */
    private ColasRespuesta calcularCapacidadLimitada(
            ColasRequest request, double lambda, double mu, int c, int n) {
        int kMax = request.getCapacidadSistema();
        if (!Double.isFinite(lambda) || !Double.isFinite(mu)
                || lambda <= 0 || mu <= 0 || c < 1 || kMax < c) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tasas positivas y finitas; capacidadSistema debe ser >= servidores");
        }

        // Logaritmos de pesos estacionarios: w(0)=1,
        // w(n)=w(n-1)*lambda/(min(n,c)*mu).
        // Log-sum-exp evita desbordamientos para capacidades grandes.
        double[] logPesos = new double[kMax + 1];
        double logLambda = Math.log(lambda);
        double logMu = Math.log(mu);
        double maxLog = 0.0;
        for (int i = 1; i <= kMax; i++) {
            logPesos[i] = logPesos[i - 1] + logLambda
                    - logMu - Math.log(Math.min(i, c));
            maxLog = Math.max(maxLog, logPesos[i]);
        }

        double suma = 0.0;
        for (double logPeso : logPesos) {
            suma += Math.exp(logPeso - maxLog);
        }

        double p0 = Math.exp(logPesos[0] - maxLog) / suma;
        double pK = Math.exp(logPesos[kMax] - maxLog) / suma;
        double pn = n > kMax ? 0.0 : Math.exp(logPesos[n] - maxLog) / suma;
        double ls = 0.0;
        double lq = 0.0;
        double ocupados = 0.0;
        double probEsperar = 0.0;
        for (int i = 0; i <= kMax; i++) {
            double pi = Math.exp(logPesos[i] - maxLog) / suma;
            ls += i * pi;
            lq += Math.max(0, i - c) * pi;
            ocupados += Math.min(i, c) * pi;
            // Una llegada espera si todos los servidores están ocupados,
            // pero aún queda espacio para entrar al sistema.
            if (i >= c && i < kMax) probEsperar += pi;
        }

        double lambdaEfectiva = mu * ocupados;
        double rechazados = lambda * pK;
        // Evitar cancelación numérica al calcular lambda*(1-pK).
        if (lambdaEfectiva <= 0 || !Double.isFinite(lambdaEfectiva)
                || !Double.isFinite(rechazados)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Parámetros fuera del rango numérico permitido");
        }
        double wq = lq / lambdaEfectiva;
        double ws = ls / lambdaEfectiva;

        ColasRespuesta respuesta = new ColasRespuesta();
        respuesta.setModelo("M/M/" + c + "/" + kMax);
        respuesta.setServidores(c);
        respuesta.setCapacidadSistema(kMax);
        respuesta.setUtilizacion(ocupados / c);
        respuesta.setProbabilidadSistemaVacio(p0);
        respuesta.setProbabilidadEsperar(probEsperar);
        respuesta.setProbabilidadNClientes(pn);
        respuesta.setProbabilidadBloqueo(pK);
        respuesta.setTasaLlegadasEfectiva(lambdaEfectiva);
        respuesta.setTasaClientesRechazados(rechazados);
        respuesta.setClientesPromedioCola(lq);
        respuesta.setClientesPromedioSistema(ls);
        respuesta.setTiempoPromedioColaHoras(wq);
        respuesta.setTiempoPromedioSistemaHoras(ws);
        respuesta.setTiempoPromedioColaMinutos(wq * 60);
        respuesta.setTiempoPromedioSistemaMinutos(ws * 60);
        return respuesta;
    }

}
