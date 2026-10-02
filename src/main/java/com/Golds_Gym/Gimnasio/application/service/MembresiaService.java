package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.CrearMembresiaRequest;
import com.Golds_Gym.Gimnasio.application.dto.MembresiaRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.model.Membresia;
import com.Golds_Gym.Gimnasio.domain.model.Plan;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.PagoRepository;
import com.Golds_Gym.Gimnasio.domain.repository.PlanRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumSet;

@Service
public class MembresiaService {

    private final MembresiaRepository membresiaRepository;
    private final ClienteRepository clienteRepository;
    private final PlanRepository planRepository;
    private final PagoRepository pagoRepository;

    public MembresiaService(
            MembresiaRepository membresiaRepository,
            ClienteRepository clienteRepository,
            PlanRepository planRepository,
            PagoRepository pagoRepository) {
        this.membresiaRepository = membresiaRepository;
        this.clienteRepository = clienteRepository;
        this.planRepository = planRepository;
        this.pagoRepository = pagoRepository;
    }

    @Transactional
    public MembresiaRespuesta crear(CrearMembresiaRequest request, Usuario creadaPor) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        if (!cliente.getUsuario().isActivo()) {
            throw new IllegalArgumentException("No se puede asignar una membresía a un cliente inactivo");
        }
        Plan plan = planRepository.findByIdAndActivoTrue(request.planId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan activo no encontrado"));

        LocalDate fechaInicio = LocalDate.now();
        var existentes = membresiaRepository.findByCliente_IdAndEstadoIn(
                cliente.getId(), EnumSet.of(EstadoMembresia.PENDIENTE, EstadoMembresia.ACTIVA));
        for (Membresia existente : existentes) {
            if (existente.getFechaFin().isBefore(fechaInicio)) {
                existente.setEstado(EstadoMembresia.VENCIDA);
            } else if (existente.getEstado() == EstadoMembresia.PENDIENTE) {
                throw new IllegalArgumentException("El cliente ya tiene una membresía pendiente de pago");
            } else {
                LocalDate siguienteDia = existente.getFechaFin().plusDays(1);
                if (siguienteDia.isAfter(fechaInicio)) {
                    fechaInicio = siguienteDia;
                }
            }
        }

        Membresia membresia = membresiaRepository.save(new Membresia(cliente, plan, creadaPor, fechaInicio));
        return convertir(membresia);
    }

    @Transactional
    public Page<MembresiaRespuesta> listar(Pageable pageable) {
        return membresiaRepository.findAllByOrderByFechaInicioDesc(pageable).map(this::convertirActualizandoEstado);
    }

    @Transactional
    public Page<MembresiaRespuesta> listarDeUsuario(Long usuarioId, Pageable pageable) {
        return membresiaRepository.findAllByCliente_Usuario_IdOrderByFechaInicioDesc(usuarioId, pageable)
                .map(this::convertirActualizandoEstado);
    }

    @Transactional
    public void cancelar(Long id) {
        Membresia membresia = buscarPorId(id);
        if (membresia.getEstado() == EstadoMembresia.VENCIDA) {
            throw new IllegalArgumentException("La membresía ya está vencida");
        }
        membresia.setEstado(EstadoMembresia.CANCELADA);
    }

    private MembresiaRespuesta convertirActualizandoEstado(Membresia membresia) {
        if ((membresia.getEstado() == EstadoMembresia.ACTIVA
                || membresia.getEstado() == EstadoMembresia.PENDIENTE)
                && membresia.getFechaFin().isBefore(LocalDate.now())) {
            membresia.setEstado(EstadoMembresia.VENCIDA);
        }
        return convertir(membresia);
    }

    private Membresia buscarPorId(Long id) {
        return membresiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membresía no encontrada"));
    }

    private MembresiaRespuesta convertir(Membresia membresia) {
        BigDecimal pagado = pagoRepository.totalPorMembresia(membresia.getId());
        BigDecimal saldo = membresia.getPrecioTotal().subtract(pagado).max(BigDecimal.ZERO);
        return new MembresiaRespuesta(
                membresia.getId(),
                membresia.getCliente().getId(),
                membresia.getCliente().getNombre(),
                membresia.getPlan().getId(),
                membresia.getPlan().getNombre(),
                membresia.getFechaInicio(),
                membresia.getFechaFin(),
                membresia.getEstado(),
                membresia.getPrecioTotal(),
                pagado,
                saldo);
    }
}