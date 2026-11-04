package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.CajaService;
import com.Golds_Gym.Gimnasio.domain.model.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/recepcion/cajas")
public class CajaController {
    private final CajaService service;

    public CajaController(CajaService service) {
        this.service = service;
    }

    private java.util.Map<String, Object> caja(Caja c) {
        java.util.Map<String, Object> r = new java.util.LinkedHashMap<>();
        r.put("id", c.getId());
        r.put("estado", c.getEstado());
        r.put("montoInicial", c.getMontoInicial());
        r.put("fechaApertura", c.getFechaApertura());
        r.put("fechaCierre", c.getFechaCierre());
        r.put("efectivoContado", c.getEfectivoContado());
        r.put("abiertaPor", c.getAbiertaPor().getUsuario());
        r.put("cerradaPor", c.getCerradaPor() == null ? null : c.getCerradaPor().getUsuario());
        r.put("observaciones", c.getObservaciones());
        return r;
    }

    private java.util.Map<String, Object> movimientoDto(MovimientoCaja m) {
        return java.util.Map.of("id", m.getId(), "cajaId", m.getCaja().getId(), "tipo", m.getTipo(), "metodo",
                m.getMetodo(), "monto", m.getMonto(), "concepto", m.getConcepto(), "fecha", m.getFecha(), "usuario",
                m.getUsuario().getUsuario());
    }

    private Usuario usuario(Authentication a) {
        return (Usuario) a.getPrincipal();
    }

    @PostMapping("/abrir")
    public java.util.Map<String, Object> abrir(@Valid @RequestBody AbrirCajaRequest r, Authentication a) {
        return caja(service.abrir(r, usuario(a)));
    }

    @GetMapping("/actual")
    public java.util.Map<String, Object> actual() {
        return caja(service.actual());
    }

    @GetMapping
    public Page<java.util.Map<String, Object>> listar(@RequestParam(defaultValue = "0") int pagina) {
        return service.listar(pagina).map(this::caja);
    }

    @PostMapping("/{id}/movimientos")
    public java.util.Map<String, Object> movimiento(@PathVariable Long id, @Valid @RequestBody MovimientoCajaRequest r,
            Authentication a) {
        return movimientoDto(service.movimiento(id, r, usuario(a)));
    }

    @GetMapping("/{id}/movimientos")
    public Page<java.util.Map<String, Object>> movimientos(@PathVariable Long id,
            @RequestParam(defaultValue = "0") int pagina) {
        return service.listarMovimientos(id, pagina).map(this::movimientoDto);
    }

    @GetMapping("/{id}/resumen")
    public CajaResumenRespuesta resumen(@PathVariable Long id) {
        return service.resumen(id);
    }

    @PostMapping("/{id}/cerrar")
    public CajaResumenRespuesta cerrar(@PathVariable Long id, @Valid @RequestBody CerrarCajaRequest r,
            Authentication a) {
        return service.cerrar(id, r, usuario(a));
    }
}
