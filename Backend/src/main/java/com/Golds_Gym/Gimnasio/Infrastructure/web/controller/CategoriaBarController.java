
package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.CategoriaBarRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.GuardarCategoriaBarRequest;
import com.Golds_Gym.Gimnasio.application.service.CategoriaBarService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categorias-bar")
public class CategoriaBarController {

    private final CategoriaBarService service;

    public CategoriaBarController(CategoriaBarService service) {
        this.service = service;
    }

    // Angular utiliza page=0, page=1, etc.
    @GetMapping
    public Page<CategoriaBarRespuesta> listar(
            @RequestParam(
                    name = "page",
                    defaultValue = "0"
            ) int pagina
    ) {
        return service.listar(pagina);
    }

    @GetMapping("/{id}")
    public CategoriaBarRespuesta buscar(
            @PathVariable Integer id
    ) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<CategoriaBarRespuesta> crear(
            @Valid @RequestBody GuardarCategoriaBarRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.crear(request));
    }

    @PutMapping("/{id}")
    public CategoriaBarRespuesta editar(
            @PathVariable Integer id,
            @Valid @RequestBody GuardarCategoriaBarRequest request
    ) {
        return service.editar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
            @PathVariable Integer id
    ) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
