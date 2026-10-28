package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.ReponerStockRequest;
import com.Golds_Gym.Gimnasio.application.dto.ReposicionStockRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.ProductoBar;
import com.Golds_Gym.Gimnasio.domain.repository.ProductoBarRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReposicionStockService {
    private final ProductoBarRepository productos;

    public ReposicionStockService(ProductoBarRepository productos) {
        this.productos = productos;
    }

    @Transactional
    public ReposicionStockRespuesta reponer(Integer id, ReponerStockRequest solicitud) {
        if (solicitud == null || solicitud.getCantidad() == null || solicitud.getCantidad() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor que cero");
        }
        ProductoBar producto = productos.bloquearPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (producto.getEstado() == null || producto.getEstado() != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede reponer un producto inactivo");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El stock actual es inválido");
        }
        int anterior = producto.getStock();
        int nuevo;
        try {
            nuevo = Math.addExact(anterior, solicitud.getCantidad());
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reposición excede el límite permitido");
        }
        producto.setStock(nuevo);
        productos.saveAndFlush(producto);
        ReposicionStockRespuesta respuesta = new ReposicionStockRespuesta();
        respuesta.setProductoId(producto.getId());
        respuesta.setProducto(producto.getNombre());
        respuesta.setStockAnterior(anterior);
        respuesta.setCantidadAgregada(solicitud.getCantidad());
        respuesta.setStockActual(nuevo);
        return respuesta;
    }
}
