package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.GuardarProductoBarRequest;
import com.Golds_Gym.Gimnasio.application.dto.ProductoBarRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ProductoBarService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/productos-bar")
public class ProductoBarController {
    private final ProductoBarService servicio;

    public ProductoBarController(ProductoBarService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public Page<ProductoBarRespuesta> listar(@RequestParam(defaultValue = "0") int pagina,
                                             @RequestParam(required = false) String nombre,
                                             @RequestParam(required = false) Integer categoriaId,
                                             @RequestParam(required = false) Byte estado) {
        return servicio.listar(pagina, nombre, categoriaId, estado);
    }

    @GetMapping("/{id}")
    public ProductoBarRespuesta buscar(@PathVariable Integer id) {
        return servicio.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ProductoBarRespuesta> crear(@Valid @RequestBody GuardarProductoBarRequest solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(solicitud));
    }

    @PutMapping("/{id}")
    public ProductoBarRespuesta editar(@PathVariable Integer id, @Valid @RequestBody GuardarProductoBarRequest solicitud) {
        return servicio.editar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        servicio.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
