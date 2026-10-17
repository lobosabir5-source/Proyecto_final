package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.AuthResponse;
import com.Golds_Gym.Gimnasio.application.dto.LoginRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.model.Membresia;
import com.Golds_Gym.Gimnasio.domain.model.Plan;
import com.Golds_Gym.Gimnasio.domain.model.Rol;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.PlanRepository;
import com.Golds_Gym.Gimnasio.domain.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PlanRepository planRepository;
    private final MembresiaRepository membresiaRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CodigoRegistroService codigoRegistroService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            PlanRepository planRepository,
            MembresiaRepository membresiaRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CodigoRegistroService codigoRegistroService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.planRepository = planRepository;
        this.membresiaRepository = membresiaRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.codigoRegistroService = codigoRegistroService;
    }

    public void solicitarCodigoRegistro(RegistroRequest request) {
        validarDisponibilidadRegistro(request);
        codigoRegistroService.enviar(request);
    }

    @Transactional
    public RegistroRespuesta verificarCodigoRegistro(RegistroRequest request, String codigo) {
        codigoRegistroService.validar(request, codigo);
        return registrarCliente(request);
    }

    @Transactional
    public RegistroRespuesta registrarCliente(RegistroRequest request) {
        validarDisponibilidadRegistro(request);
        Plan plan = planRepository.findByIdAndActivoTrue(request.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("El plan elegido ya no está disponible"));

        Usuario usuario = new Usuario(request.getUsuario(), passwordEncoder.encode(request.getPassword()), Rol.CLIENTE);
        usuario.setActivo(false);
        usuario = usuarioRepository.save(usuario);

        Cliente cliente = clienteRepository.save(new Cliente(
                usuario,
                request.getNombre(),
                request.getCorreo(),
                request.getTelefono(),
                request.getFechaNacimiento()));

        Membresia membresia = membresiaRepository.save(new Membresia(cliente, plan, usuario, LocalDate.now()));

        return new RegistroRespuesta(
                usuario.getUsuario(),
                membresia.getId(),
                plan.getNombre(),
                membresia.getPrecioTotal(),
                "Correo verificado. Tu cuenta quedará inactiva hasta que un administrador revise y apruebe tu registro.");
    }

    private void validarDisponibilidadRegistro(RegistroRequest request) {
        if (clienteRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        if (clienteRepository.existsByTelefono(request.getTelefono())) {
            throw new IllegalArgumentException("El celular ya está registrado");
        }
        planRepository.findByIdAndActivoTrue(request.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("El plan elegido ya no está disponible"));

        validarDatos(request.getUsuario(), request.getPassword());
        if (usuarioRepository.existsByUsuarioIgnoreCase(request.getUsuario())) {
            throw new IllegalArgumentException("Ese nombre de usuario ya está en uso");
        }
    }

    public AuthResponse iniciarSesion(LoginRequest request) {
        Authentication autenticacion;
        try {
            autenticacion = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.usuario(), request.password()));
        } catch (DisabledException e) {
            throw cuentaBloqueada(request);
        }
        Usuario usuario = (Usuario) autenticacion.getPrincipal();
        return generarRespuesta(usuario);
    }

    private RuntimeException cuentaBloqueada(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsuario(request.usuario()).orElse(null);
        if (usuario == null || !passwordEncoder.matches(request.password(), usuario.getPassword())) {
            return new BadCredentialsException("Usuario o contraseña incorrectos");
        }

        boolean pendienteDePago = membresiaRepository.existsByCliente_Usuario_IdAndCreadaPor_IdAndEstado(
                usuario.getId(), usuario.getId(), EstadoMembresia.PENDIENTE);
        return new CuentaInactivaException(pendienteDePago
                ? "Tu cuenta está pendiente de pago y aprobación. Un administrador debe activarla antes de que puedas iniciar sesión."
                : "Tu cuenta está desactivada. Comunícate con administración.");
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
        if (usuarioRepository.existsByUsuarioIgnoreCase(nombre)) {
            throw new IllegalArgumentException("Ese nombre de usuario ya está en uso");
        }
        return usuarioRepository.save(new Usuario(nombre, passwordEncoder.encode(password), rol));
    }

    private AuthResponse generarRespuesta(Usuario usuario) {
        return new AuthResponse(
                jwtService.generarToken(usuario),
                usuario.getUsuario(),
                nombreVisible(usuario),
                usuario.getRol());
    }

    @Transactional(readOnly = true)
    public String nombreVisible(Usuario usuario) {
        if (usuario.getRol() == Rol.CLIENTE) {
            return clienteRepository.findByUsuarioId(usuario.getId())
                    .map(Cliente::getNombre)
                    .orElse(usuario.getUsuario());
        }
        return usuario.getUsuario();
    }

    private void validarDatos(String usuario, String password) {
        if (usuario == null || usuario.isBlank() || password == null || password.length() < 8) {
            throw new IllegalArgumentException("el usuario es obligatorio y la contraseña debe tener al menos 8 caracteres");
        }
    }
}
