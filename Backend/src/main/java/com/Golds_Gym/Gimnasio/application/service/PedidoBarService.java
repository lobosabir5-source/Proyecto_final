package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.CrearPedidoBarRequest;
import com.Golds_Gym.Gimnasio.application.dto.PedidoBarRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PedidoBarService {
    private final PedidoBarRepository pedidos;
    private final PedidoBarDetalleRepository detalles;
    private final ProductoBarRepository productos;
    private final UsuarioRepository usuarios;
    private final MetodoPagoBarRepository metodos;

    public PedidoBarService(PedidoBarRepository pedidos, PedidoBarDetalleRepository detalles,
                            ProductoBarRepository productos, UsuarioRepository usuarios,
                            MetodoPagoBarRepository metodos) {
        this.pedidos = pedidos;
        this.detalles = detalles;
        this.productos = productos;
        this.usuarios = usuarios;
        this.metodos = metodos;
    }

    @Transactional
    public PedidoBarRespuesta crear(CrearPedidoBarRequest request) {
        Usuario usuario = usuarios.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!usuario.isActivo()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario inactivo");
        MetodoPagoEntidad metodo = metodos.findById(request.getMetodoPagoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Método de pago no encontrado"));

        // Unifica productos repetidos para descontar cada stock una sola vez.
        TreeMap<Integer, Integer> cantidades = new TreeMap<>();
        for (CrearPedidoBarRequest.Item item : request.getItems()) {
            if (item == null || item.getProductoId() == null || item.getCantidad() == null || item.getCantidad() <= 0)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto o cantidad inválidos");
            try {
                cantidades.merge(item.getProductoId(), item.getCantidad(), Math::addExact);
            } catch (ArithmeticException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad demasiado grande");
            }
        }
        if (cantidades.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido sin productos");

        List<PedidoBarDetalle> lineas = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (var entrada : cantidades.entrySet()) {
            // Bloqueo de fila hasta el commit: evita sobreventa concurrente.
            ProductoBar producto = productos.bloquearPorId(entrada.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + entrada.getKey()));
            int cantidad = entrada.getValue();
            if (producto.getEstado() == null || producto.getEstado() != 1)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Producto inactivo: " + producto.getId());
            if (producto.getStock() < cantidad)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente: " + producto.getNombre());
            producto.setStock(producto.getStock() - cantidad);
            PedidoBarDetalle detalle = new PedidoBarDetalle();
            detalle.setProducto(producto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(producto.getPrecio());
            lineas.add(detalle);
            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(cantidad)));
        }
        PedidoBar pedido = new PedidoBar();
        pedido.setUsuario(usuario);
        pedido.setMetodoPago(metodo);
        pedido.setTotal(total);
        pedido.setEstado((byte) 1); // Pendiente
        pedido.setEstadoPago((byte) 0); // Pendiente de pago, no simula cobro
        pedido.setFechaPedido(LocalDateTime.now());
        pedidos.saveAndFlush(pedido);
        for (PedidoBarDetalle linea : lineas) linea.setPedido(pedido);
        detalles.saveAllAndFlush(lineas);
        return convertir(pedido, lineas);
    }

    @Transactional(readOnly = true)
    public PedidoBarRespuesta buscar(Integer id) {
        PedidoBar pedido = pedidos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        return convertir(pedido, detalles.findByPedidoIdOrderByIdAsc(id));
    }

    @Transactional(readOnly = true)
    public Page<PedidoBarRespuesta> listar(int pagina) {
        if (pagina < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Página inválida");
        return pedidos.findAll(PageRequest.of(pagina, 10, Sort.by(Sort.Direction.DESC, "id")))
                .map(p -> convertir(p, detalles.findByPedidoIdOrderByIdAsc(p.getId())));
    }

    private PedidoBarRespuesta convertir(PedidoBar p, List<PedidoBarDetalle> lineas) {
        PedidoBarRespuesta r = new PedidoBarRespuesta();
        r.setId(p.getId());
        r.setUsuarioId(p.getUsuario().getId());
        r.setMetodoPagoId(p.getMetodoPago().getId());
        r.setTotal(p.getTotal());
        r.setEstado(p.getEstado());
        r.setEstadoPago(p.getEstadoPago());
        r.setFechaPedido(p.getFechaPedido());
        List<PedidoBarRespuesta.Item> items = new ArrayList<>();
        for (PedidoBarDetalle d : lineas) {
            PedidoBarRespuesta.Item i = new PedidoBarRespuesta.Item();
            i.setProductoId(d.getProducto().getId());
            i.setNombre(d.getProducto().getNombre());
            i.setCantidad(d.getCantidad());
            i.setPrecioUnitario(d.getPrecioUnitario());
            i.setSubtotal(d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())));
            items.add(i);
        }
        r.setItems(items);
        return r;
    }
}
