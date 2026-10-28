
package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.InventarioProbabilisticoRequest;
import com.Golds_Gym.Gimnasio.application.dto.InventarioProbabilisticoRespuesta;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventarioProbabilisticoService {

    public InventarioProbabilisticoRespuesta calcular(
            InventarioProbabilisticoRequest request) {

        double d = request.getDemandaDiaria();
        double sigma = request.getDesviacionDiaria();
        double l = request.getTiempoEntregaDias();
        double nivel = request.getNivelServicio();
        int stock = request.getStockActual();

        if (!Double.isFinite(d) || d <= 0 ||
                !Double.isFinite(sigma) || sigma < 0 ||
                !Double.isFinite(l) || l <= 0 ||
                !Double.isFinite(nivel) ||
                nivel <= 0 || nivel >= 1 ||
                stock < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Parámetros de inventario inválidos"
            );
        }

        double media = d * l;
        double desviacion = sigma * Math.sqrt(l);
        double z = normalInversa(nivel);
        double seguridad = Math.max(0, z * desviacion);
        double punto = media + seguridad;

        if (!Double.isFinite(media) ||
                !Double.isFinite(desviacion) ||
                !Double.isFinite(seguridad) ||
                !Double.isFinite(punto) ||
                punto > Integer.MAX_VALUE ||
                seguridad > Integer.MAX_VALUE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los parámetros exceden el rango permitido"
            );
        }

        int seguridadEntera = (int) Math.ceil(seguridad);
        int puntoEntero = (int) Math.ceil(media + seguridadEntera);

        boolean reponer = stock <= puntoEntero;

        InventarioProbabilisticoRespuesta respuesta =
                new InventarioProbabilisticoRespuesta();

        respuesta.setDemandaDuranteEntrega(media);
        respuesta.setDesviacionDuranteEntrega(desviacion);
        respuesta.setValorZ(z);
        respuesta.setStockSeguridad(seguridad);
        respuesta.setStockSeguridadUnidades(seguridadEntera);
        respuesta.setPuntoReorden(punto);
        respuesta.setPuntoReordenUnidades(puntoEntero);
        respuesta.setStockActual(stock);
        respuesta.setRequiereReposicion(reponer);

        respuesta.setRecomendacion(reponer
                ? "Se recomienda realizar un pedido."
                : "El inventario supera el punto de reorden.");

        return respuesta;
    }

    // Aproximación de la normal estándar inversa
    // Algoritmo racional de Peter J. Acklam.
    private double normalInversa(double p) {

        double[] a = {
                -39.69683028665376,
                220.9460984245205,
                -275.9285104469687,
                138.3577518672690,
                -30.66479806614716,
                2.506628277459239
        };

        double[] b = {
                -54.47609879822406,
                161.5858368580409,
                -155.6989798598866,
                66.80131188771972,
                -13.28068155288572
        };

        double[] c = {
                -0.007784894002430293,
                -0.3223964580411365,
                -2.400758277161838,
                -2.549732539343734,
                4.374664141464968,
                2.938163982698783
        };

        double[] e = {
                0.007784695709041462,
                0.3224671290700398,
                2.445134137142996,
                3.754408661907416
        };

        double q;
        double r;

        if (p < 0.02425) {
            q = Math.sqrt(-2 * Math.log(p));

            return (((((c[0]*q+c[1])*q+c[2])*q+c[3])
                    *q+c[4])*q+c[5]) /
                    ((((e[0]*q+e[1])*q+e[2])*q+e[3])
                            *q+1);
        }

        if (p > 0.97575) {
            q = Math.sqrt(-2 * Math.log(1-p));

            return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])
                    *q+c[4])*q+c[5]) /
                    ((((e[0]*q+e[1])*q+e[2])*q+e[3])
                            *q+1);
        }

        q = p - 0.5;
        r = q*q;

        return (((((a[0]*r+a[1])*r+a[2])*r+a[3])
                *r+a[4])*r+a[5])*q /
                (((((b[0]*r+b[1])*r+b[2])*r+b[3])
                        *r+b[4])*r+1);
    }
}
