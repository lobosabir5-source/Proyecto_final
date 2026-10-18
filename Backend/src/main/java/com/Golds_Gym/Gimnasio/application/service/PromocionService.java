package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.*;
import java.math.BigDecimal;

@Getter
@Setter
@Service
public class PromocionService {
    private final PromocionRepository promociones;
    private final PlanRepository planes;

    public PromocionService(PromocionRepository promociones, PlanRepository planes) {
        this.promociones = promociones;
        this.planes = planes;
    }

    @Transactional
    public PromocionRespuesta guardar(Long id, GuardarPromocionSolicitud solicitud) {
        if (solicitud.fechaFin().isBefore(solicitud.fechaInicio()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vigencia inválida");

        if (solicitud.tipo() == Promocion.TipoDescuento.PORCENTAJE
                && solicitud.valor().compareTo(BigDecimal.valueOf(100)) > 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Porcentaje máximo 100");
        Promocion p = id == null ? new Promocion()
                : promociones.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        p.setNombre(solicitud.nombre());
        p.setTipo(solicitud.tipo());
        p.setValor(solicitud.valor());
        p.setFechaInicio(solicitud.fechaInicio());
        p.setFechaFin(solicitud.fechaFin());
        p.setActivo(solicitud.activo());
        p.setPlan(solicitud.planId() == null ? null
                : planes.findById(solicitud.planId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado")));
        return respuesta(promociones.save(p));
    }

    @Transactional(readOnly = true)
    public Page<PromocionRespuesta> listar(int pagina, int tamano) {
        if (pagina < 0 || tamano < 1 || tamano > 10)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Máximo 10 registros");
        return promociones.findAll(PageRequest.of(pagina, tamano, Sort.by("id").descending())).map(this::respuesta);
    }

    @Transactional(readOnly = true)
    public java.util.List<PromocionRespuesta> listarVigentes() {
        java.time.LocalDate hoy = java.time.LocalDate.now();
        return promociones.findByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(hoy, hoy)
                .stream().map(this::respuesta).toList();
    }

    @Transactional(readOnly = true)
    public PromocionRespuesta obtener(Long id) {
        return respuesta(promociones.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public void desactivar(Long id) {
        Promocion p = promociones.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        p.setActivo(false);
    }

    public BigDecimal aplicar(BigDecimal precio, Long planId, java.time.LocalDate fecha) {
        BigDecimal resultado = precio;
        for (Promocion p : promociones.findByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(fecha,
                fecha)) {
            if (p.getPlan() != null && !p.getPlan().getId().equals(planId))
                continue;
            BigDecimal descuento = p.getTipo() == Promocion.TipoDescuento.PORCENTAJE
                    ? precio.multiply(p.getValor()).divide(BigDecimal.valueOf(100))
                    : p.getValor();
            resultado = resultado.min(precio.subtract(descuento).max(BigDecimal.ZERO));
        }
        return resultado;
    }

    private PromocionRespuesta respuesta(Promocion p) {
        return new PromocionRespuesta(p.getId(), p.getNombre(), p.getTipo(), p.getValor(), p.getFechaInicio(),
                p.getFechaFin(), p.getPlan() == null ? null : p.getPlan().getId(), p.isActivo());
    }
}
