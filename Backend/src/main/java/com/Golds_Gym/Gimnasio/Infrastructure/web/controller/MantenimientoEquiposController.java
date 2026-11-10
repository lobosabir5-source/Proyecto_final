package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.MantenimientoEquiposService;
import com.Golds_Gym.Gimnasio.domain.model.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin/mantenimiento-equipos")
public class MantenimientoEquiposController {
    private final MantenimientoEquiposService service;

    public MantenimientoEquiposController(MantenimientoEquiposService service) {
        this.service = service;
    }

    @GetMapping("/equipos")
    public Page<EquipoRespuesta> equipos(@RequestParam(required = false) String texto,
            @RequestParam(required = false) Equipo.Estado estado, @RequestParam(defaultValue = "0") int pagina) {
        return service.listarEquipos(texto, estado, pagina);
    }

    @GetMapping("/equipos/{id}")
    public EquipoRespuesta equipo(@PathVariable Long id) {
        return service.obtenerEquipo(id);
    }

    @PostMapping("/equipos")
    @ResponseStatus(HttpStatus.CREATED)
    public EquipoRespuesta crear(@Valid @RequestBody GuardarEquipoRequest r) {
        return service.crearEquipo(r);
    }

    @PutMapping("/equipos/{id}")
    public EquipoRespuesta editar(@PathVariable Long id, @Valid @RequestBody GuardarEquipoRequest r) {
        return service.editarEquipo(id, r);
    }

    @PostMapping("/equipos/{id}/programar-semana")
    public List<MantenimientoRespuesta> semana(@PathVariable Long id, @RequestParam(required = false) LocalDate fecha) {
        return service.programarSemana(id, fecha);
    }

    @GetMapping("/registros")
    public Page<MantenimientoRespuesta> registros(@RequestParam(required = false) Long equipoId,
            @RequestParam(required = false) MantenimientoEquipo.Estado estado,
            @RequestParam(required = false) Boolean vencidos, @RequestParam(defaultValue = "0") int pagina) {
        return service.listarMantenimientos(equipoId, estado, vencidos, pagina);
    }

    @GetMapping("/registros/{id}")
    public MantenimientoRespuesta registro(@PathVariable Long id) {
        return service.obtenerMantenimiento(id);
    }

    @PostMapping("/registros")
    @ResponseStatus(HttpStatus.CREATED)
    public MantenimientoRespuesta programar(@Valid @RequestBody GuardarMantenimientoRequest r) {
        return service.programar(r);
    }

    public record CompletarRequest(LocalDate fechaRealizada, @NotBlank String trabajoRealizado, String observaciones,
            Equipo.Estado estadoEquipo) {
    }

    @PatchMapping("/registros/{id}/completar")
    public MantenimientoRespuesta completar(@PathVariable Long id, @Valid @RequestBody CompletarRequest r) {
        return service.completar(id, r.fechaRealizada(), r.trabajoRealizado(), r.observaciones(), r.estadoEquipo());
    }

    public record CancelarRequest(@NotBlank String motivo) {
    }

    @PatchMapping("/registros/{id}/cancelar")
    public MantenimientoRespuesta cancelar(@PathVariable Long id, @Valid @RequestBody CancelarRequest r) {
        return service.cancelar(id, r.motivo());
    }

    @GetMapping("/alertas")
    public Map<String, Long> alertas() {
        return service.alertas();
    }
}
