package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.UsuarioAdminRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioAdminService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioAdminRespuesta> listar(Pageable pageable) {
        return usuarioRepository.findAllByOrderByUsuarioAsc(pageable).map(this::convertir);
    }

    @Transactional
    public UsuarioAdminRespuesta cambiarEstado(Long id, boolean activo, Long administradorId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (id.equals(administradorId) && !activo) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta");
        }
        usuario.setActivo(activo);
        return convertir(usuario);
    }

    private UsuarioAdminRespuesta convertir(Usuario usuario) {
        return new UsuarioAdminRespuesta(usuario.getId(), usuario.getUsuario(), usuario.getRol(), usuario.isActivo());
    }
}