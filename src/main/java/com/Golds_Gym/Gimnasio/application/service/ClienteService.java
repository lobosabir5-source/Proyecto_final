package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.ActualizarClienteRequest;
import com.Golds_Gym.Gimnasio.application.dto.ClienteRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.CrearClienteRequest;
import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final AuthService authService;

    public ClienteService(ClienteRepository clienteRepository, AuthService authService) {
        this.clienteRepository = clienteRepository;
        this.authService = authService;
    }

    @Transactional
    public ClienteRespuesta crear(CrearClienteRequest request) {
        if (clienteRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        Usuario usuario = authService.crearCuentaCliente(request.getUsuario(), request.getPassword());
        Cliente cliente = clienteRepository.save(new Cliente(
                usuario,
            request.getNombre(),
            request.getCorreo(),
            request.getTelefono(),
            request.getFechaNacimiento()));
        return convertir(cliente);
    }

    @Transactional(readOnly = true)
    public Page<ClienteRespuesta> listar(Pageable pageable) {
        return clienteRepository.findAllByOrderByNombreAsc(pageable).map(this::convertir);
    }

    @Transactional(readOnly = true)
    public ClienteRespuesta obtener(Long id) {
        return convertir(buscarPorId(id));
    }

    @Transactional(readOnly = true)
    public ClienteRespuesta obtenerDeUsuario(Long usuarioId) {
        Cliente cliente = clienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente no encontrado"));
        return convertir(cliente);
    }

    @Transactional
    public ClienteRespuesta actualizar(Long id, ActualizarClienteRequest request) {
        Cliente cliente = buscarPorId(id);
        actualizarDatos(cliente, request);
        return convertir(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteRespuesta actualizarDeUsuario(Long usuarioId, ActualizarClienteRequest request) {
        Cliente cliente = clienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente no encontrado"));
        actualizarDatos(cliente, request);
        return convertir(clienteRepository.save(cliente));
    }

    @Transactional
    public void desactivar(Long id) {
        Cliente cliente = buscarPorId(id);
        cliente.getUsuario().setActivo(false);
    }

    private void actualizarDatos(Cliente cliente, ActualizarClienteRequest request) {
        if (!cliente.getCorreo().equals(request.getCorreo())
            && clienteRepository.existsByCorreoAndIdNot(request.getCorreo(), cliente.getId())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        cliente.setNombre(request.getNombre());
        cliente.setCorreo(request.getCorreo());
        cliente.setTelefono(request.getTelefono());
        cliente.setFechaNacimiento(request.getFechaNacimiento());
    }

    private Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
    }

    private ClienteRespuesta convertir(Cliente cliente) {
        Usuario usuario = cliente.getUsuario();
        return new ClienteRespuesta(
                cliente.getId(),
                usuario.getId(),
                usuario.getUsuario(),
                cliente.getNombre(),
                cliente.getCorreo(),
                cliente.getTelefono(),
                cliente.getFechaNacimiento(),
                cliente.getFechaAlta(),
                usuario.isActivo());
    }
}