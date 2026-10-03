package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.ActualizarUsuarioRequest;
import com.Golds_Gym.Gimnasio.application.dto.UsuarioAdminRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioAdminService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioAdminRespuesta> listar(Pageable pageable) {
        return usuarioRepository.findAllByOrderByUsuarioAsc(pageable).map(this::convertir);
    }

    @Transactional
    public UsuarioAdminRespuesta cambiarEstado(Long id, boolean activo, Long administradorId) {
        Usuario usuario = buscar(id);
        if (id.equals(administradorId) && !activo) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta");
        }
        usuario.setActivo(activo);
        return convertir(usuario);
    }

    @Transactional
    public UsuarioAdminRespuesta actualizar(Long id, ActualizarUsuarioRequest request, Long administradorId) {
        Usuario usuario = buscar(id);
        boolean esPropia = id.equals(administradorId);

        if (usuario.getRol() == Rol.CLIENTE) {
            throw new IllegalArgumentException("Los clientes no se editan desde aquí");
        }
        if (request.rol() == Rol.CLIENTE) {
            throw new IllegalArgumentException("Un usuario del personal no puede pasar a ser cliente");
        }
        if (esPropia && request.rol() != usuario.getRol()) {
            throw new IllegalArgumentException("No puedes cambiar tu propio rol");
        }
        if (esPropia && !usuario.getUsuario().equals(request.usuario())) {
            // el token JWT usa el nombre de usuario; cambiarlo cerraría tu sesión
            throw new IllegalArgumentException("No puedes cambiar tu propio nombre de usuario");
        }
        if (!usuario.getUsuario().equals(request.usuario())
                && usuarioRepository.existsByUsuario(request.usuario())) {
            throw new IllegalArgumentException("el usuario ya existe");
        }

        usuario.setUsuario(request.usuario());
        usuario.setRol(request.rol());
        if (request.password() != null) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }
        return convertir(usuario);
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private UsuarioAdminRespuesta convertir(Usuario usuario) {
        return new UsuarioAdminRespuesta(usuario.getId(), usuario.getUsuario(), usuario.getRol(), usuario.isActivo());
    }
}