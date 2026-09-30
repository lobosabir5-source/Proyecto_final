package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.AuthResponse;
import com.Golds_Gym.Gimnasio.application.dto.LoginRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRequest;
import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse registrarCliente(RegistroRequest request) {
        if (clienteRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        Usuario usuario = crearCuentaCliente(request.getUsuario(), request.getPassword());
        clienteRepository.save(new Cliente(
                usuario,
            request.getNombre(),
            request.getCorreo(),
            request.getTelefono(),
            request.getFechaNacimiento()));
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
        if (rol == Rol.CLIENTE) {
            throw new IllegalArgumentException("Los clientes deben registrarse con sus datos personales");
        }
        return crearCuenta(nombre, password, rol);
    }

    public Usuario crearCuentaCliente(String nombre, String password) {
        validarDatos(nombre, password);
        return crearCuenta(nombre, password, Rol.CLIENTE);
    }

    private Usuario crearCuenta(String nombre, String password, Rol rol) {
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
