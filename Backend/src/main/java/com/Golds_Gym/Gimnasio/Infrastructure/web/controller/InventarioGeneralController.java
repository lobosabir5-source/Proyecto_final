package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.InventarioGeneralService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventario-general")
public class InventarioGeneralController {
    private final InventarioGeneralService servicio;

    public InventarioGeneralController(InventarioGeneralService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public Page<ItemInventarioRespuesta> listar(@RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String nombre, @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Boolean activo, @RequestParam(required = false) Boolean bajoMinimo) {
        return servicio.listar(page, nombre, categoria, activo, bajoMinimo);
    }

    @GetMapping("/{id}")
    public ItemInventarioRespuesta buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ItemInventarioRespuesta> crear(@Valid @RequestBody GuardarItemInventarioRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(r));
    }

    @PutMapping("/{id}")
    public ItemInventarioRespuesta editar(@PathVariable Long id, @Valid @RequestBody GuardarItemInventarioRequest r) {
        return servicio.editar(id, r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        servicio.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/movimientos")
    public ResponseEntity<MovimientoInventarioRespuesta> registrar(@PathVariable Long id,
            @Valid @RequestBody RegistrarMovimientoInventarioRequest r, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.registrar(id, r, auth == null ? null : auth.getName()));
    }

    @GetMapping("/{id}/movimientos")
    public Page<MovimientoInventarioRespuesta> historial(@PathVariable Long id,
            @RequestParam(defaultValue = "0") int page) {
        return servicio.historial(id, page);
    }
}