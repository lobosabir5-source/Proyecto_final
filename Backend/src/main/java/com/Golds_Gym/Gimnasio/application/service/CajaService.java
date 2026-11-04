package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CajaService {
    private final CajaRepository cajas;
    private final MovimientoCajaRepository movimientos;

    public CajaService(CajaRepository cajas, MovimientoCajaRepository movimientos) {
        this.cajas = cajas;
        this.movimientos = movimientos;
    }

    private ResponseStatusException error(HttpStatus status, String msg) {
        return new ResponseStatusException(status, msg);
    }

    @Transactional
    public Caja abrir(AbrirCajaRequest req, Usuario usuario) {
        if (cajas.findFirstByEstadoOrderByIdDesc("ABIERTA").isPresent())
            throw error(HttpStatus.CONFLICT, "Ya existe una caja abierta");
        Caja c = new Caja();
        c.setMontoInicial(req.montoInicial());
        c.setAbiertaPor(usuario);
        c.setFechaApertura(LocalDateTime.now());
        c.setEstado("ABIERTA");
        return cajas.save(c);
    }

    @Transactional(readOnly = true)
    public Caja actual() {
        return cajas.findFirstByEstadoOrderByIdDesc("ABIERTA")
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "No hay caja abierta"));
    }

    @Transactional(readOnly = true)
    public Page<Caja> listar(int pagina) {
        return cajas.findAllByOrderByIdDesc(PageRequest.of(Math.max(0, pagina), 10));
    }

    @Transactional
    public MovimientoCaja movimiento(Long id, MovimientoCajaRequest req, Usuario usuario) {
        Caja c = cajas.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Caja no encontrada"));
        if (!"ABIERTA".equals(c.getEstado()))
            throw error(HttpStatus.CONFLICT, "La caja está cerrada");
        String tipo = req.tipo().trim().toUpperCase(Locale.ROOT);
        if (!tipo.equals("INGRESO") && !tipo.equals("EGRESO"))
            throw error(HttpStatus.BAD_REQUEST, "Tipo debe ser INGRESO o EGRESO");
        if (req.concepto().length() > 250)
            throw error(HttpStatus.BAD_REQUEST, "Concepto demasiado largo");
        MovimientoCaja m = new MovimientoCaja();
        m.setCaja(c);
        m.setUsuario(usuario);
        m.setTipo(tipo);
        m.setMetodo(req.metodo());
        m.setMonto(req.monto());
        m.setConcepto(req.concepto());
        m.setFecha(LocalDateTime.now());
        return movimientos.save(m);
    }

    @Transactional(readOnly = true)
    public Page<MovimientoCaja> listarMovimientos(Long id, int pagina) {
        if (!cajas.existsById(id))
            throw error(HttpStatus.NOT_FOUND, "Caja no encontrada");
        return movimientos.findByCaja_IdOrderByIdDesc(id, PageRequest.of(Math.max(0, pagina), 10));
    }

    @Transactional(readOnly = true)
    public CajaResumenRespuesta resumen(Long id) {
        Caja c = cajas.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Caja no encontrada"));
        return calcular(c);
    }

    private CajaResumenRespuesta calcular(Caja c) {
        BigDecimal ie = BigDecimal.ZERO, iq = BigDecimal.ZERO, ee = BigDecimal.ZERO, eq = BigDecimal.ZERO;
        for (MovimientoCaja m : movimientos.findByCaja_Id(c.getId())) {
            if (m.getTipo().equals("INGRESO")) {
                if (m.getMetodo() == MetodoPago.EFECTIVO)
                    ie = ie.add(m.getMonto());
                else
                    iq = iq.add(m.getMonto());
            } else {
                if (m.getMetodo() == MetodoPago.EFECTIVO)
                    ee = ee.add(m.getMonto());
                else
                    eq = eq.add(m.getMonto());
            }
        }
        BigDecimal esperado = c.getMontoInicial().add(ie).subtract(ee);
        BigDecimal diferencia = c.getEfectivoContado() == null ? null : c.getEfectivoContado().subtract(esperado);
        return new CajaResumenRespuesta(c.getId(), c.getEstado(), c.getMontoInicial(), ie, iq, ee, eq, esperado,
                c.getEfectivoContado(), diferencia);
    }

    @Transactional
    public CajaResumenRespuesta cerrar(Long id, CerrarCajaRequest req, Usuario usuario) {
        Caja c = cajas.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Caja no encontrada"));
        if (!"ABIERTA".equals(c.getEstado()))
            throw error(HttpStatus.CONFLICT, "La caja ya está cerrada");
        if (req.observaciones() != null && req.observaciones().length() > 500)
            throw error(HttpStatus.BAD_REQUEST, "Observaciones demasiado largas");
        c.setEfectivoContado(req.efectivoContado());
        c.setObservaciones(req.observaciones());
        c.setCerradaPor(usuario);
        c.setFechaCierre(LocalDateTime.now());
        c.setEstado("CERRADA");
        cajas.save(c);
        return calcular(c);
    }

    @Transactional
    public void registrarCobro(Long origenId, BigDecimal monto, MetodoPago metodo, Usuario usuario) {
        Caja c = actual();
        c = cajas.bloquear(c.getId()).orElseThrow();
        if (!"ABIERTA".equals(c.getEstado()))
            throw error(HttpStatus.CONFLICT, "Caja cerrada");
        if (movimientos.existsByOrigenTipoAndOrigenId("PAGO_MEMBRESIA", origenId))
            return;
        MovimientoCaja m = new MovimientoCaja();
        m.setCaja(c);
        m.setUsuario(usuario);
        m.setTipo("INGRESO");
        m.setMetodo(metodo);
        m.setMonto(monto);
        m.setConcepto("Pago de membresía #" + origenId);
        m.setFecha(LocalDateTime.now());
        m.setOrigenTipo("PAGO_MEMBRESIA");
        m.setOrigenId(origenId);
        movimientos.save(m);
    }
}
