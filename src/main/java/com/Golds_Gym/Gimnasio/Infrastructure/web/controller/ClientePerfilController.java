package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ActualizarClienteRequest;
import com.Golds_Gym.Gimnasio.application.dto.ClienteRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ClienteService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cliente/perfil")
public class ClientePerfilController {

    private final ClienteService clienteService;

    public ClientePerfilController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ClienteRespuesta obtener(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return clienteService.obtenerDeUsuario(usuario.getId());
    }

    @PutMapping
    public ClienteRespuesta actualizar(
            Authentication authentication,
            @Valid @RequestBody ActualizarClienteRequest request) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return clienteService.actualizarDeUsuario(usuario.getId(), request);
    }
}