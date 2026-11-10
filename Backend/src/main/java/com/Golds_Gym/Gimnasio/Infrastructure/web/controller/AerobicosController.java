package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.AerobicosService;
import com.Golds_Gym.Gimnasio.domain.model.ClaseAerobica;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.*;

@RestController
@RequestMapping("/api/admin/aerobicos")
public class AerobicosController {
    private final AerobicosService service;

    public AerobicosController(AerobicosService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ClaseAerobicaRespuesta> listar(@RequestParam(required = false) LocalDate fecha,
            @RequestParam(defaultValue = "0") int pagina) {
        return service.listar(fecha, pagina);
    }

    @GetMapping("/{id}")
    public ClaseAerobicaRespuesta obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClaseAerobicaRespuesta crear(@Valid @RequestBody GuardarClaseAerobicaRequest r) {
        return service.crear(r);
    }

    @PutMapping("/{id}")
    public ClaseAerobicaRespuesta editar(@PathVariable Long id, @Valid @RequestBody GuardarClaseAerobicaRequest r) {
        return service.editar(id, r);
    }

    public record EstadoRequest(@NotNull ClaseAerobica.Estado estado) {
    }

    public record MomentoRequest(LocalDateTime momento) {
    }

    public record AsistenciaRequest(@NotNull Boolean asistio) {
    }

    public record InscribirRequest(@NotNull Long clienteId) {
    }

    @PatchMapping("/{id}/estado")
    public ClaseAerobicaRespuesta estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        return service.estado(id, r.estado());
    }

    @PatchMapping("/{id}/llegada-instructor")
    public ClaseAerobicaRespuesta llegadaInstructor(@PathVariable Long id,
            @RequestBody(required = false) MomentoRequest r) {
        return service.llegadaInstructor(id, r == null ? null : r.momento());
    }

    @PostMapping("/{id}/inscripciones")
    @ResponseStatus(HttpStatus.CREATED)
    public InscripcionAerobicaRespuesta inscribir(@PathVariable Long id, @Valid @RequestBody InscribirRequest r) {
        return service.inscribir(id, r.clienteId());
    }

    @GetMapping("/{id}/inscripciones")
    public Page<InscripcionAerobicaRespuesta> inscripciones(@PathVariable Long id,
            @RequestParam(defaultValue = "0") int pagina) {
        return service.inscripciones(id, pagina);
    }

    @PatchMapping("/inscripciones/{id}/llegada")
    public InscripcionAerobicaRespuesta llegada(@PathVariable Long id,
            @RequestBody(required = false) MomentoRequest r) {
        return service.llegadaCliente(id, r == null ? null : r.momento());
    }

    @PatchMapping("/inscripciones/{id}/asistencia")
    public InscripcionAerobicaRespuesta asistencia(@PathVariable Long id, @Valid @RequestBody AsistenciaRequest r) {
        return service.asistencia(id, r.asistio());
    }

    @PatchMapping("/inscripciones/{id}/cancelar")
    public InscripcionAerobicaRespuesta cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }
}
