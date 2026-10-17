package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import com.Golds_Gym.Gimnasio.application.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.List;

@Service
public class RenovacionMembresiaService {
    private final MembresiaRepository membresias;
    private final HistorialMembresiaRepository historial;
    private final PromocionService promociones;

    public RenovacionMembresiaService(MembresiaRepository membresias, HistorialMembresiaRepository historial,
            PromocionService promociones) {
        this.membresias = membresias;
        this.historial = historial;
        this.promociones = promociones;
    }

    @Transactional
    public HistorialMembresiaRespuesta renovar(Long id) {
        Membresia m = membresias.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (m.getEstado() == EstadoMembresia.CANCELADA)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Membresía cancelada");
        LocalDate anterior = m.getFechaFin();
        LocalDate inicio = anterior.isBefore(LocalDate.now()) ? LocalDate.now() : anterior.plusDays(1);
        LocalDate fin = inicio.plusDays(m.getPlan().getDuracionDias() - 1L);
        var precio = promociones.aplicar(m.getPlan().getPrecio(), m.getPlan().getId(), LocalDate.now());
        m.setFechaFin(fin);
        m.setPrecioTotal(m.getPrecioTotal().add(precio));
        m.setEstado(EstadoMembresia.PENDIENTE);
        HistorialMembresia h = new HistorialMembresia();
        h.setMembresia(m);
        h.setFechaAnterior(anterior);
        h.setFechaNueva(fin);
        h.setPrecioAplicado(precio);
        h.setOperacion("RENOVACION");
        return convertir(historial.save(h));
    }

    @Transactional(readOnly = true)
    public List<HistorialMembresiaRespuesta> historial(Long clienteId) {
        return historial.findByMembresia_Cliente_IdOrderByFechaOperacionDesc(clienteId).stream().map(this::convertir)
                .toList();
    }

    private HistorialMembresiaRespuesta convertir(HistorialMembresia h) {
        return new HistorialMembresiaRespuesta(h.getId(), h.getMembresia().getId(), h.getFechaAnterior(),
                h.getFechaNueva(), h.getPrecioAplicado(), h.getFechaOperacion(), h.getOperacion(),
                h.getMembresia().getPlan().getPrecio().subtract(h.getPrecioAplicado()).max(java.math.BigDecimal.ZERO));
    }
}