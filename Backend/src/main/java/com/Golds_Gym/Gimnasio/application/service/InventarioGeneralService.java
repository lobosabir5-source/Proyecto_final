package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.Locale;

@Service
public class InventarioGeneralService {
    private final ItemInventarioRepository items;
    private final MovimientoInventarioRepository movimientos;

    public InventarioGeneralService(ItemInventarioRepository items, MovimientoInventarioRepository movimientos) {
        this.items = items;
        this.movimientos = movimientos;
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }

    private ItemInventario obtener(Long id) {
        return items.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
    }

    private String categoria(String valor) {
        String v = valor.trim().toUpperCase(Locale.ROOT);
        if (!java.util.Set.of("LIMPIEZA", "BEBIDA", "LACTEO", "OTRO").contains(v))
            throw error(HttpStatus.BAD_REQUEST, "Categoria invalida");
        return v;
    }

    private String unidad(String valor) {
        String v = valor.trim().toUpperCase(Locale.ROOT);
        if (!java.util.Set.of("UNIDAD", "LITRO", "MILILITRO", "KILOGRAMO", "GRAMO", "PAQUETE").contains(v))
            throw error(HttpStatus.BAD_REQUEST, "Unidad invalida");
        return v;
    }

    private void validarDecimal(BigDecimal n) {
        if (n.scale() > 3)
            throw error(HttpStatus.BAD_REQUEST, "Maximo 3 decimales");
        if (n.precision() - n.scale() > 11)
            throw error(HttpStatus.BAD_REQUEST, "Cantidad demasiado grande");
    }

    private ItemInventarioRespuesta dto(ItemInventario i) {
        return new ItemInventarioRespuesta(i.getId(), i.getNombre(), i.getCategoria(), i.getUnidad(), i.getExistencia(),
                i.getMinimo(), i.getExistencia().compareTo(i.getMinimo()) <= 0, i.getDescripcion(), i.isActivo());
    }

    private MovimientoInventarioRespuesta dto(MovimientoInventario m) {
        return new MovimientoInventarioRespuesta(m.getId(), m.getItem().getId(), m.getTipo(), m.getCantidad(),
                m.getSaldoAnterior(), m.getSaldoPosterior(), m.getResponsable(), m.getMotivo(), m.getFecha());
    }

    @Transactional(readOnly = true)
    public Page<ItemInventarioRespuesta> listar(int page, String nombre, String categoria, Boolean activo,
            Boolean bajoMinimo) {
        if (page < 0)
            throw error(HttpStatus.BAD_REQUEST, "Pagina invalida");
        Specification<ItemInventario> s = (r, q, c) -> c.conjunction();
        if (nombre != null && !nombre.isBlank()) {
            String n = "%" + nombre.trim().toLowerCase(Locale.ROOT) + "%";
            s = s.and((r, q, c) -> c.like(c.lower(r.get("nombre")), n));
        }
        if (categoria != null && !categoria.isBlank()) {
            String cat = categoria(categoria);
            s = s.and((r, q, c) -> c.equal(r.get("categoria"), cat));
        }
        if (activo != null)
            s = s.and((r, q, c) -> c.equal(r.get("activo"), activo));
        if (Boolean.TRUE.equals(bajoMinimo))
            s = s.and((r, q, c) -> c.lessThanOrEqualTo(r.get("existencia"), r.get("minimo")));
        return items.findAll(s, PageRequest.of(page, 10, Sort.by("id").descending())).map(this::dto);
    }

    @Transactional(readOnly = true)
    public ItemInventarioRespuesta buscar(Long id) {
        return dto(obtener(id));
    }

    @Transactional
    public ItemInventarioRespuesta crear(GuardarItemInventarioRequest r) {
        validarDecimal(r.minimo());
        ItemInventario i = new ItemInventario();
        aplicar(i, r);
        return dto(items.save(i));
    }

    private void aplicar(ItemInventario i, GuardarItemInventarioRequest r) {
        i.setNombre(r.nombre().trim());
        i.setCategoria(categoria(r.categoria()));
        i.setUnidad(unidad(r.unidad()));
        i.setMinimo(r.minimo());
        i.setDescripcion(r.descripcion() == null ? null : r.descripcion().trim());
    }

    @Transactional
    public ItemInventarioRespuesta editar(Long id, GuardarItemInventarioRequest r) {
        validarDecimal(r.minimo());
        ItemInventario i = items.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
        if (!i.isActivo())
            throw error(HttpStatus.CONFLICT, "Insumo inactivo");
        if (!i.getUnidad().equals(unidad(r.unidad())) && i.getExistencia().signum() != 0)
            throw error(HttpStatus.CONFLICT, "No se puede cambiar la unidad con existencias");
        aplicar(i, r);
        return dto(i);
    }

    @Transactional
    public void desactivar(Long id) {
        ItemInventario i = items.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
        i.setActivo(false);
    }

    @Transactional
    public MovimientoInventarioRespuesta registrar(Long id, RegistrarMovimientoInventarioRequest r, String usuario) {
        if (usuario == null || usuario.isBlank())
            throw error(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        ItemInventario i = items.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
        if (!i.isActivo())
            throw error(HttpStatus.CONFLICT, "Insumo inactivo");
        validarDecimal(r.cantidad());
        String tipo = r.tipo().trim().toUpperCase(Locale.ROOT);
        if (!tipo.equals("ENTRADA") && !tipo.equals("SALIDA"))
            throw error(HttpStatus.BAD_REQUEST, "Tipo debe ser ENTRADA o SALIDA");
        BigDecimal anterior = i.getExistencia();
        BigDecimal posterior = tipo.equals("ENTRADA") ? anterior.add(r.cantidad()) : anterior.subtract(r.cantidad());
        if (posterior.signum() < 0)
            throw error(HttpStatus.CONFLICT, "Existencias insuficientes");
        validarDecimal(posterior);
        i.setExistencia(posterior);
        MovimientoInventario m = new MovimientoInventario();
        m.setItem(i);
        m.setTipo(tipo);
        m.setCantidad(r.cantidad());
        m.setSaldoAnterior(anterior);
        m.setSaldoPosterior(posterior);
        m.setResponsable(usuario);
        m.setMotivo(r.motivo());
        return dto(movimientos.save(m));
    }

    @Transactional(readOnly = true)
    public Page<MovimientoInventarioRespuesta> historial(Long id, int page) {
        if (page < 0)
            throw error(HttpStatus.BAD_REQUEST, "Pagina invalida");
        obtener(id);
        return movimientos
                .findByItemId(id,
                        PageRequest.of(page, 10, Sort.by("fecha").descending().and(Sort.by("id").descending())))
                .map(this::dto);
    }
}