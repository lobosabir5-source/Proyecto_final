package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ActualizarClienteRequest;
import com.Golds_Gym.Gimnasio.application.dto.ClienteRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.CrearClienteRequest;
import com.Golds_Gym.Gimnasio.application.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recepcion/clientes")
public class ClienteRecepcionController {

    private final ClienteService clienteService;

    public ClienteRecepcionController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public Page<ClienteRespuesta> listar(@PageableDefault(size = 20) Pageable pageable) {
        return clienteService.listar(pageable);
    }

    @GetMapping("/{id}")
    public ClienteRespuesta obtener(@PathVariable Long id) {
        return clienteService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<ClienteRespuesta> crear(@Valid @RequestBody CrearClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(request));
    }

    @PutMapping("/{id}")
    public ClienteRespuesta actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarClienteRequest request) {
        return clienteService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        clienteService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}