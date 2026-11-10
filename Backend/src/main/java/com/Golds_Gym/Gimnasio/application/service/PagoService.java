package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.PagoRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.RegistrarPagoRequest;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.model.Membresia;
import com.Golds_Gym.Gimnasio.domain.model.Pago;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.PagoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final MembresiaRepository membresiaRepository;

    public PagoService(PagoRepository pagoRepository, MembresiaRepository membresiaRepository) {
        this.pagoRepository = pagoRepository;
        this.membresiaRepository = membresiaRepository;
    }

    @Transactional
    public PagoRespuesta registrar(RegistrarPagoRequest request, Usuario registradoPor) {
        if (request == null || request.membresiaId() == null || request.monto() == null ||
                request.monto().signum() <= 0 || request.monto().scale() > 2 || request.metodo() == null
                || registradoPor == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos de pago invalidos");
        Membresia m = membresiaRepository.findByIdForUpdate(request.membresiaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membresia no encontrada"));
        if (m.getEstado() == EstadoMembresia.CANCELADA)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Membresia cancelada");
        BigDecimal saldo = m.getPrecioTotal().subtract(pagoRepository.totalPorMembresia(m.getId()));
        if (request.monto().compareTo(saldo) > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pago excede el saldo pendiente");
        Pago pago = pagoRepository.saveAndFlush(new Pago(m, registradoPor, request.monto(), request.metodo()));
        LocalDate hoy = LocalDate.now();
        if (m.getFechaFin().isBefore(hoy))
            m.setEstado(EstadoMembresia.VENCIDA);
        else if (m.getFechaInicio().isAfter(hoy))
            m.setEstado(EstadoMembresia.PENDIENTE);
        else if (!m.getFechaFin().isAfter(hoy.plusDays(7)))
            m.setEstado(EstadoMembresia.POR_VENCER);
        else
            m.setEstado(EstadoMembresia.ACTIVA);
        return convertir(pago);
    }

    @Transactional(readOnly = true)
    public List<PagoRespuesta> listarDeMembresia(Long membresiaId) {
        if (!membresiaRepository.existsById(membresiaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Membresía no encontrada");
        }
        return pagoRepository.findAllByMembresia_IdOrderByFechaPagoDesc(membresiaId)
                .stream().map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public Page<PagoRespuesta> listarDeUsuario(Long usuarioId, Pageable pageable) {
        return pagoRepository
                .findAllByMembresia_Cliente_Usuario_IdOrderByFechaPagoDesc(usuarioId,
                        PageRequest.of(pageable.getPageNumber(), 10, pageable.getSort()))
                .map(this::convertir);
    }

    private void actualizarVencimiento(Membresia membresia) {
        if ((membresia.getEstado() == EstadoMembresia.ACTIVA
                || membresia.getEstado() == EstadoMembresia.PENDIENTE)
                && membresia.getFechaFin().isBefore(LocalDate.now())) {
            membresia.setEstado(EstadoMembresia.VENCIDA);
        }
    }

    @Transactional(readOnly = true)
    public List<PagoRespuesta> recientes() {
        return pagoRepository.findTop5ByOrderByFechaPagoDesc().stream().map(this::convertir).toList();
    }

    private PagoRespuesta convertir(Pago pago) {
        return new PagoRespuesta(
                pago.getId(),
                pago.getMembresia().getId(),
                pago.getMembresia().getCliente().getNombre(),
                pago.getMonto(),
                pago.getMetodo(),
                pago.getFechaPago(),
                pago.getRegistradoPor().getUsuario());
    }
}
