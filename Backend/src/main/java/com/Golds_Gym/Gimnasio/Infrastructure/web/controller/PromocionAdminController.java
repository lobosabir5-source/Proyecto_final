package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.PromocionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/admin/promociones")
@PreAuthorize("hasRole('ADMIN')")
public class PromocionAdminController {
    private final PromocionService servicio;

    public PromocionAdminController(PromocionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public Page<PromocionRespuesta> listar(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return servicio.listar(page, size);
    }

    @GetMapping("/{id}")
    public PromocionRespuesta obtener(@PathVariable Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromocionRespuesta crear(@Valid @RequestBody GuardarPromocionSolicitud s) {
        return servicio.guardar(null, s);
    }

    @PutMapping("/{id}")
    public PromocionRespuesta editar(@PathVariable Long id, @Valid @RequestBody GuardarPromocionSolicitud s) {
        return servicio.guardar(id, s);
    }

    // Imagen almacenada fuera de PostgreSQL; en la entidad se conserva su URL.
    @PostMapping(value = "/{id}/imagen", consumes = "multipart/form-data")
    public PromocionRespuesta subirImagen(@PathVariable Long id,
            @RequestParam("archivo") org.springframework.web.multipart.MultipartFile archivo) {
        return servicio.subirImagen(id, archivo);
    }

    @DeleteMapping("/{id}/imagen")
    public PromocionRespuesta quitarImagen(@PathVariable Long id) {
        return servicio.quitarImagen(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        servicio.desactivar(id);
    }
}
