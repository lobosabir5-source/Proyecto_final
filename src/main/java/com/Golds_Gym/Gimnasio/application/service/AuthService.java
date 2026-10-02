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

    public AuthService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            PlanRepository planRepository,
            MembresiaRepository membresiaRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.planRepository = planRepository;
        this.membresiaRepository = membresiaRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegistroRespuesta registrarCliente(RegistroRequest request) {
        if (clienteRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        Plan plan = planRepository.findByIdAndActivoTrue(request.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("El plan elegido ya no está disponible"));

        validarDatos(request.getUsuario(), request.getPassword());
        if (usuarioRepository.existsByUsuario(request.getUsuario())) {
            throw new IllegalArgumentException("el usuario ya existe");
        }

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
                "Cuenta creada. Se activará cuando recepción confirme tu pago.");
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
                ? "Tu cuenta está pendiente de pago. Acércate a recepción para confirmarlo y activarla."
                : "Tu cuenta está desactivada. Comunícate con el gimnasio.");
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