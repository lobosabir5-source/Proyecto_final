package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.AuthResponse;
import com.Golds_Gym.Gimnasio.application.dto.LoginRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRequest;
import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse registrarCliente(RegistroRequest request) {
        validarDatos(request.usuario(), request.password());
        if (usuarioRepository.existsByUsuario(request.usuario())) {
            throw new IllegalArgumentException("el usuario ya existe");
        }

        Usuario usuario = new Usuario(
                request.usuario(),
                passwordEncoder.encode(request.password()),
                Rol.CLIENTE);
        usuarioRepository.save(usuario);
        return generarRespuesta(usuario);
    }

    public AuthResponse iniciarSesion(LoginRequest request) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usuario(), request.password()));
        Usuario usuario = (Usuario) autenticacion.getPrincipal();
        return generarRespuesta(usuario);
    }

    public Usuario crearUsuario(String nombre, String password, Rol rol) {
        validarDatos(nombre, password);
        if (rol == null) {
            throw new IllegalArgumentException("el rol es obligatorio");
        }
        if (usuarioRepository.existsByUsuario(nombre)) {
            throw new IllegalArgumentException("el usuario ya existe");
        }

        return usuarioRepository.save(new Usuario(nombre, passwordEncoder.encode(password), rol));
    }

    private AuthResponse generarRespuesta(Usuario usuario) {
        return new AuthResponse(jwtService.generarToken(usuario), usuario.getUsuario(), usuario.getRol());
    }

    private void validarDatos(String usuario, String password) {
        if (usuario == null || usuario.isBlank() || password == null || password.length() < 8) {
            throw new IllegalArgumentException("el usuario es obligatorio y la contraseña debe tener al menos 8 caracteres");
        }
    }
}
