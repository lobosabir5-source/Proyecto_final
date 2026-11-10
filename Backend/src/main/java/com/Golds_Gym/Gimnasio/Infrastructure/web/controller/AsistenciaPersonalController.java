package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.AsistenciaPersonalService;
import com.Golds_Gym.Gimnasio.domain.model.AsistenciaPersonal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/asistencias-personal")
public class AsistenciaPersonalController {
    private final AsistenciaPersonalService service;

    public AsistenciaPersonalController(AsistenciaPersonalService service) {
        this.service = service;
    }

    @GetMapping
    public Page<AsistenciaPersonalRespuesta> listar(@RequestParam(required = false) Long personalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) AsistenciaPersonal.Turno turno,
            @RequestParam(required = false) AsistenciaPersonal.Estado estado,
            @RequestParam(defaultValue = "0") int pagina) {
        return service.listar(personalId, desde, hasta, turno, estado, pagina);
    }

    @GetMapping("/{id}")
    public AsistenciaPersonalRespuesta obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AsistenciaPersonalRespuesta crear(@Valid @RequestBody GuardarAsistenciaPersonalRequest r) {
        return service.crear(r);
    }

    @PutMapping("/{id}")
    public AsistenciaPersonalRespuesta actualizar(@PathVariable Long id,
            @Valid @RequestBody GuardarAsistenciaPersonalRequest r) {
        return service.actualizar(id, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
