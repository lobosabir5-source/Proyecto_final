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
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class MantenimientoEquiposService {
    private final EquipoRepository equipos;
    private final MantenimientoEquipoRepository mantenimientos;
    private final PersonalRepository personal;

    public MantenimientoEquiposService(EquipoRepository equipos, MantenimientoEquipoRepository mantenimientos,
            PersonalRepository personal) {
        this.equipos = equipos;
        this.mantenimientos = mantenimientos;
        this.personal = personal;
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }

    private Equipo equipo(Long id) {
        return equipos.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
    }

    private MantenimientoEquipo mantenimiento(Long id) {
        return mantenimientos.findById(id)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Mantenimiento no encontrado"));
    }

    private Personal tecnico(Long id) {
        if (id == null)
            return null;
        Personal p = personal.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Personal no encontrado"));
        if (p.getEstadoLaboral() != Personal.EstadoLaboral.ACTIVO)
            throw error(HttpStatus.BAD_REQUEST, "El responsable debe estar activo");
        return p;
    }

    private Pageable pagina(int p) {
        if (p < 0)
            throw error(HttpStatus.BAD_REQUEST, "Pagina invalida");
        return PageRequest.of(p, 10, Sort.by("id").descending());
    }

    @Transactional(readOnly = true)
    public Page<EquipoRespuesta> listarEquipos(String texto, Equipo.Estado estado, int p) {
        return equipos.findAll((root, q, cb) -> {
            var clauses = new ArrayList<jakarta.persistence.criteria.Predicate>();
            if (estado != null)
                clauses.add(cb.equal(root.get("estado"), estado));
            if (texto != null && !texto.isBlank()) {
                String t = "%" + texto.toLowerCase().trim() + "%";
                clauses.add(cb.or(cb.like(cb.lower(root.get("codigo")), t), cb.like(cb.lower(root.get("nombre")), t),
                        cb.like(cb.lower(root.get("tipo")), t)));
            }
            return cb.and(clauses.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pagina(p)).map(EquipoRespuesta::desde);
    }

    @Transactional(readOnly = true)
    public EquipoRespuesta obtenerEquipo(Long id) {
        return EquipoRespuesta.desde(equipo(id));
    }

    @Transactional
    public EquipoRespuesta crearEquipo(GuardarEquipoRequest r) {
        if (equipos.existsByCodigo(r.getCodigo().trim()))
            throw error(HttpStatus.CONFLICT, "Codigo duplicado");
        Equipo e = new Equipo();
        copiar(r, e);
        return EquipoRespuesta.desde(equipos.save(e));
    }

    @Transactional
    public EquipoRespuesta editarEquipo(Long id, GuardarEquipoRequest r) {
        Equipo e = equipo(id);
        if (equipos.existsByCodigoAndIdNot(r.getCodigo().trim(), id))
            throw error(HttpStatus.CONFLICT, "Codigo duplicado");
        copiar(r, e);
        return EquipoRespuesta.desde(equipos.save(e));
    }

    private void copiar(GuardarEquipoRequest r, Equipo e) {
        DayOfWeek d1 = r.getDiaUno() == null ? DayOfWeek.MONDAY : r.getDiaUno(),
                d2 = r.getDiaDos() == null ? DayOfWeek.THURSDAY : r.getDiaDos();
        if (d1 == d2)
            throw error(HttpStatus.BAD_REQUEST, "Los dos dias deben ser diferentes");
        e.setCodigo(r.getCodigo().trim());
        e.setNombre(r.getNombre().trim());
        e.setTipo(r.getTipo().trim());
        e.setUbicacion(r.getUbicacion());
        e.setDescripcion(r.getDescripcion());
        e.setEstado(r.getEstado() == null ? Equipo.Estado.OPERATIVO : r.getEstado());
        e.setMantenimientoActivo(r.getMantenimientoActivo() == null ? true : r.getMantenimientoActivo());
        e.setDiaUno(d1);
        e.setDiaDos(d2);
        e.setTecnico(tecnico(r.getTecnicoId()));
        e.setFechaAlta(r.getFechaAlta() == null ? LocalDate.now() : r.getFechaAlta());
    }

    @Transactional(readOnly = true)
    public Page<MantenimientoRespuesta> listarMantenimientos(Long equipoId, MantenimientoEquipo.Estado estado,
            Boolean vencidos, int p) {
        LocalDate hoy = LocalDate.now();
        return mantenimientos.findAll((root, q, cb) -> {
            var a = new ArrayList<jakarta.persistence.criteria.Predicate>();
            if (equipoId != null)
                a.add(cb.equal(root.get("equipo").get("id"), equipoId));
            if (estado != null)
                a.add(cb.equal(root.get("estado"), estado));
            if (Boolean.TRUE.equals(vencidos)) {
                a.add(cb.equal(root.get("estado"), MantenimientoEquipo.Estado.PENDIENTE));
                a.add(cb.lessThan(root.get("fechaProgramada"), hoy));
            }
            return cb.and(a.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pagina(p)).map(MantenimientoRespuesta::desde);
    }

    @Transactional(readOnly = true)
    public MantenimientoRespuesta obtenerMantenimiento(Long id) {
        return MantenimientoRespuesta.desde(mantenimiento(id));
    }

    @Transactional
    public MantenimientoRespuesta programar(GuardarMantenimientoRequest r) {
        Equipo e = equipo(r.getEquipoId());
        if (mantenimientos.existsByEquipoIdAndFechaProgramada(e.getId(), r.getFechaProgramada()))
            throw error(HttpStatus.CONFLICT, "Ya existe mantenimiento para esta fecha");
        MantenimientoEquipo m = new MantenimientoEquipo();
        m.setEquipo(e);
        m.setFechaProgramada(r.getFechaProgramada());
        m.setTecnico(r.getTecnicoId() == null ? e.getTecnico() : tecnico(r.getTecnicoId()));
        m.setObservaciones(r.getObservaciones());
        return MantenimientoRespuesta.desde(mantenimientos.save(m));
    }

    @Transactional
    public List<MantenimientoRespuesta> programarSemana(Long equipoId, LocalDate fecha) {
        Equipo e = equipo(equipoId);
        if (!Boolean.TRUE.equals(e.getMantenimientoActivo()))
            throw error(HttpStatus.BAD_REQUEST, "Programacion desactivada");
        LocalDate lunes = (fecha == null ? LocalDate.now() : fecha)
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<MantenimientoRespuesta> result = new ArrayList<>();
        for (DayOfWeek dia : List.of(e.getDiaUno(), e.getDiaDos())) {
            LocalDate f = lunes.plusDays(dia.getValue() - 1);
            if (!mantenimientos.existsByEquipoIdAndFechaProgramada(equipoId, f)) {
                MantenimientoEquipo m = new MantenimientoEquipo();
                m.setEquipo(e);
                m.setTecnico(e.getTecnico());
                m.setFechaProgramada(f);
                result.add(MantenimientoRespuesta.desde(mantenimientos.save(m)));
            }
        }
        return result;
    }

    @Transactional
    public MantenimientoRespuesta completar(Long id, LocalDate fecha, String trabajo, String observaciones,
            Equipo.Estado estadoEquipo) {
        MantenimientoEquipo m = mantenimiento(id);
        if (m.getEstado() != MantenimientoEquipo.Estado.PENDIENTE)
            throw error(HttpStatus.CONFLICT, "El mantenimiento no esta pendiente");
        if (trabajo == null || trabajo.isBlank())
            throw error(HttpStatus.BAD_REQUEST, "Trabajo realizado requerido");
        m.setEstado(MantenimientoEquipo.Estado.REALIZADO);
        m.setFechaRealizada(fecha == null ? LocalDate.now() : fecha);
        m.setTrabajoRealizado(trabajo.trim());
        m.setObservaciones(observaciones);
        if (estadoEquipo != null)
            m.getEquipo().setEstado(estadoEquipo);
        return MantenimientoRespuesta.desde(mantenimientos.save(m));
    }

    @Transactional
    public MantenimientoRespuesta cancelar(Long id, String motivo) {
        MantenimientoEquipo m = mantenimiento(id);
        if (m.getEstado() != MantenimientoEquipo.Estado.PENDIENTE)
            throw error(HttpStatus.CONFLICT, "Solo se cancela un pendiente");
        m.setEstado(MantenimientoEquipo.Estado.CANCELADO);
        m.setObservaciones(motivo);
        return MantenimientoRespuesta.desde(mantenimientos.save(m));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> alertas() {
        LocalDate hoy = LocalDate.now();
        long vencidos = mantenimientos
                .count((r, q, cb) -> cb.and(cb.equal(r.get("estado"), MantenimientoEquipo.Estado.PENDIENTE),
                        cb.lessThan(r.get("fechaProgramada"), hoy)));
        long hoyPendientes = mantenimientos
                .count((r, q, cb) -> cb.and(cb.equal(r.get("estado"), MantenimientoEquipo.Estado.PENDIENTE),
                        cb.equal(r.get("fechaProgramada"), hoy)));
        long fuera = equipos.count((r, q, cb) -> cb.equal(r.get("estado"), Equipo.Estado.FUERA_DE_SERVICIO));
        long revision = equipos.count((r, q, cb) -> cb.equal(r.get("estado"), Equipo.Estado.EN_MANTENIMIENTO));
        return Map.of("mantenimientosVencidos", vencidos, "mantenimientosHoy", hoyPendientes, "equiposFueraServicio",
                fuera, "equiposEnMantenimiento", revision);
    }
}
