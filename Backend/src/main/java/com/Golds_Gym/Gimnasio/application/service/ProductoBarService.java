package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.GuardarProductoBarRequest;
import com.Golds_Gym.Gimnasio.application.dto.ProductoBarRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.CategoriaBar;
import com.Golds_Gym.Gimnasio.domain.model.ProductoBar;
import com.Golds_Gym.Gimnasio.domain.repository.CategoriaBarRepository;
import com.Golds_Gym.Gimnasio.domain.repository.ProductoBarRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class ProductoBarService {
    private final ProductoBarRepository productos;
    private final CategoriaBarRepository categorias;

    public ProductoBarService(ProductoBarRepository productos, CategoriaBarRepository categorias) {
        this.productos = productos;
        this.categorias = categorias;
    }

    @Transactional(readOnly = true)
    public Page<ProductoBarRespuesta> listar(int pagina, String nombre, Integer categoriaId, Byte estado) {
        if (pagina < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La página no puede ser negativa");
        if (estado != null && estado != 0 && estado != 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado debe ser 0 o 1");

        Specification<ProductoBar> filtro = (root, query, cb) -> cb.conjunction();
        if (nombre != null && !nombre.isBlank()) {
            String busqueda = "%" + nombre.trim().toLowerCase(Locale.ROOT) + "%";
            filtro = filtro.and((root, query, cb) -> cb.like(cb.lower(root.get("nombre")), busqueda));
        }
        if (categoriaId != null)
            filtro = filtro.and((root, query, cb) -> cb.equal(root.get("categoria").get("id"), categoriaId));
        if (estado != null)
            filtro = filtro.and((root, query, cb) -> cb.equal(root.get("estado"), estado));

        return productos.findAll(filtro, PageRequest.of(pagina, 10, Sort.by("id").ascending()))
                .map(this::respuesta);
    }

    @Transactional(readOnly = true)
    public ProductoBarRespuesta buscar(Integer id) {
        return respuesta(obtener(id));
    }

    @Transactional
    public ProductoBarRespuesta crear(GuardarProductoBarRequest solicitud) {
        String nombre = solicitud.getNombre().trim();
        if (productos.existsByNombreIgnoreCase(nombre))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un producto con ese nombre");
        ProductoBar producto = new ProductoBar();
        aplicar(producto, solicitud);
        producto.setEstado((byte) 1);
        producto.setCreadoEn(LocalDateTime.now());
        return respuesta(productos.save(producto));
    }

    @Transactional
    public ProductoBarRespuesta editar(Integer id, GuardarProductoBarRequest solicitud) {
        ProductoBar producto = obtener(id);
        if (producto.getEstado() == 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede editar un producto desactivado");
        if (productos.existsByNombreIgnoreCaseAndIdNot(solicitud.getNombre().trim(), id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe otro producto con ese nombre");
        aplicar(producto, solicitud);
        return respuesta(productos.save(producto));
    }

    @Transactional
    public void desactivar(Integer id) {
        ProductoBar producto = obtener(id);
        producto.setEstado((byte) 0);
    }

    private void aplicar(ProductoBar producto, GuardarProductoBarRequest solicitud) {
        CategoriaBar categoria = categorias.findById(solicitud.getCategoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
        if (categoria.getEstado() != 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoría está desactivada");
        producto.setNombre(solicitud.getNombre().trim());
        producto.setDescripcion(limpiar(solicitud.getDescripcion()));
        producto.setPrecio(solicitud.getPrecio());
        producto.setStock(solicitud.getStock());
        producto.setImagenUrl(limpiar(solicitud.getImagenUrl()));
        producto.setCategoria(categoria);
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private ProductoBar obtener(Integer id) {
        return productos.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private ProductoBarRespuesta respuesta(ProductoBar p) {
        ProductoBarRespuesta r = new ProductoBarRespuesta();
        r.setId(p.getId());
        r.setNombre(p.getNombre());
        r.setDescripcion(p.getDescripcion());
        r.setPrecio(p.getPrecio());
        r.setStock(p.getStock());
        r.setImagenUrl(p.getImagenUrl());
        r.setEstado(p.getEstado());
        r.setCreadoEn(p.getCreadoEn());
        r.setCategoriaId(p.getCategoria().getId());
        r.setCategoriaNombre(p.getCategoria().getNombre());
        return r;
    }
}
