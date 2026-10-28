package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.CrearPedidoBarRequest;
import com.Golds_Gym.Gimnasio.application.dto.PedidoBarRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PedidoBarService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/pedidos-bar")
public class PedidoBarController {
    private final PedidoBarService servicio;
    public PedidoBarController(PedidoBarService servicio) { this.servicio = servicio; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoBarRespuesta crear(@Valid @RequestBody CrearPedidoBarRequest solicitud) {
        return servicio.crear(solicitud);
    }

    @GetMapping("/{id}")
    public PedidoBarRespuesta buscar(@PathVariable Integer id) { return servicio.buscar(id); }

    @GetMapping
    public Page<PedidoBarRespuesta> listar(@RequestParam(defaultValue = "0") int pagina) {
        return servicio.listar(pagina);
    }
}
