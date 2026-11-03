package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class PermisoAusenciaService {
    private final PermisoAusenciaRepository permisos;
    private final MembresiaRepository membresias;
    public PermisoAusenciaService(PermisoAusenciaRepository permisos, MembresiaRepository membresias) {
        this.permisos = permisos;
        this.membresias = membresias;
    }
    private Pageable pagina(Pageable p) {
        return PageRequest.of(p.getPageNumber(), Math.min(p.getPageSize(), 10), p.getSort());
    }
    private PermisoAusenciaRespuesta respuesta(PermisoAusencia p) {
        return new PermisoAusenciaRespuesta(p.getId(), p.getMembresia().getId(), p.getMotivo(),
            p.getDiasAgregados(), p.getSolicitadoEn(), p.getFechaInicio(), p.getFechaFin(),
            p.getEstado() == null ? null : p.getEstado().name(), p.getResueltoEn());
    }
    @Transactional(readOnly = true)
    public Page<PermisoAusenciaRespuesta> listarDeUsuario(Long usuarioId, Pageable pageable) {
        return permisos.findByMembresia_Cliente_Usuario_IdOrderBySolicitadoEnDesc(usuarioId, pagina(pageable)).map(this::respuesta);
    }
    @Transactional(readOnly = true)
    public Page<PermisoAusenciaRespuesta> listarTodos(Pageable pageable) {
        return permisos.findAllByOrderBySolicitadoEnDesc(pagina(pageable)).map(this::respuesta);
    }
    @Transactional
    public PermisoAusenciaRespuesta solicitar(Long usuarioId, SolicitarPermisoRequest req) {
        Membresia m = membresias.findByIdForUpdate(req.membresiaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membresía no encontrada"));
        if (!m.getCliente().getUsuario().getId().equals(usuarioId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Membresía ajena");
        validarFechas(m, req.fechaInicio(), req.fechaFin());
        verificarSaldo(m, req.fechaInicio(), req.fechaFin(), null);
        PermisoAusencia p = new PermisoAusencia();
        p.setMembresia(m); p.setMotivo(req.motivo().trim());
        p.setFechaInicio(req.fechaInicio()); p.setFechaFin(req.fechaFin());
        p.setDiasAgregados(0); p.setEstado(EstadoPermiso.PENDIENTE);
        p.setSolicitadoEn(LocalDateTime.now());
        return respuesta(permisos.save(p));
    }
    private void validarFechas(Membresia m, LocalDate desde, LocalDate hasta) {
        if (desde == null || hasta == null || hasta.isBefore(desde))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fechas inválidas");
        if (ChronoUnit.DAYS.between(desde, hasta) > 2)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Máximo 3 días por solicitud");
        if (desde.isBefore(m.getFechaInicio()) || hasta.isAfter(m.getFechaFin()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fechas fuera de la membresía vigente");
        if (m.getEstado() == EstadoMembresia.CANCELADA || m.getEstado() == EstadoMembresia.PENDIENTE)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Membresía no habilitada");
    }
    private void verificarSaldo(Membresia m, LocalDate desde, LocalDate hasta, Integer excluirId) {
        // Los permisos históricos sin fechas se conservan pero requieren revisión manual.
        List<PermisoAusencia> existentes = permisos.findByMembresia_Cliente_Id(m.getCliente().getId());
        for (PermisoAusencia anterior : existentes) {
            if (Objects.equals(anterior.getId(), excluirId) || anterior.getEstado() == EstadoPermiso.RECHAZADO) continue;
            if (anterior.getFechaInicio() == null || anterior.getFechaFin() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Existen permisos históricos sin fechas; requieren revisión");
            }
            if (!hasta.isBefore(anterior.getFechaInicio()) && !desde.isAfter(anterior.getFechaFin()))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Permiso solapado");
        }
        for (LocalDate dia = desde; !dia.isAfter(hasta); dia = dia.plusDays(1)) {
            int usados = 0;
            for (PermisoAusencia anterior : existentes) {
                if (Objects.equals(anterior.getId(), excluirId) || anterior.getEstado() == EstadoPermiso.RECHAZADO ||
                    anterior.getFechaInicio() == null || anterior.getFechaFin() == null) continue;
                for (LocalDate d = anterior.getFechaInicio(); !d.isAfter(anterior.getFechaFin()); d = d.plusDays(1))
                    if (d.getYear() == dia.getYear() && d.getMonth() == dia.getMonth()) usados++;
            }
            int nuevos = 0;
            for (LocalDate d = desde; !d.isAfter(hasta); d = d.plusDays(1))
                if (d.getYear() == dia.getYear() && d.getMonth() == dia.getMonth()) nuevos++;
            if (usados + nuevos > 3)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Se exceden los 3 días del mes calendario");
        }
    }
    @Transactional
    public PermisoAusenciaRespuesta resolver(Integer id, boolean aprobar) {
        PermisoAusencia p = permisos.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permiso no encontrado"));
        Membresia m = membresias.findByIdForUpdate(p.getMembresia().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membresía no encontrada"));
        // Relectura tras el bloqueo para evitar aprobaciones concurrentes.
        p = permisos.findById(id).orElseThrow();
        if (p.getEstado() != EstadoPermiso.PENDIENTE)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La solicitud ya fue resuelta");
        if (aprobar) {
            validarFechas(m, p.getFechaInicio(), p.getFechaFin());
            verificarSaldo(m, p.getFechaInicio(), p.getFechaFin(), p.getId());
            int dias = (int) ChronoUnit.DAYS.between(p.getFechaInicio(), p.getFechaFin()) + 1;
            m.setFechaFin(m.getFechaFin().plusDays(dias));
            p.setDiasAgregados(dias);
            p.setEstado(EstadoPermiso.APROBADO);
        } else {
            p.setDiasAgregados(0);
            p.setEstado(EstadoPermiso.RECHAZADO);
        }
        p.setResueltoEn(LocalDateTime.now());
        return respuesta(permisos.save(p));
    }
}
