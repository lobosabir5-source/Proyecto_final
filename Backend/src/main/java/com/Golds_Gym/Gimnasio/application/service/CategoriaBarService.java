package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.CategoriaBarRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.GuardarCategoriaBarRequest;
import com.Golds_Gym.Gimnasio.domain.model.CategoriaBar;
import com.Golds_Gym.Gimnasio.domain.repository.CategoriaBarRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoriaBarService {
    private final CategoriaBarRepository repository;

    public CategoriaBarService(CategoriaBarRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<CategoriaBarRespuesta> listar(int pagina) {
        if (pagina < 0) throw new IllegalArgumentException("La página no puede ser negativa");
        return repository.findAll(PageRequest.of(pagina, 10, Sort.by("id").ascending()))
                .map(this::respuesta);
    }

    @Transactional(readOnly = true)
    public CategoriaBarRespuesta buscar(Integer id) {
        return respuesta(obtener(id));
    }

    @Transactional
    public CategoriaBarRespuesta crear(GuardarCategoriaBarRequest request) {
        String nombre = normalizarNombre(request.getNombre());
        if (repository.existsByNombreIgnoreCase(nombre))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe esa categoría");
        CategoriaBar categoria = new CategoriaBar();
        categoria.setNombre(nombre);
        categoria.setDescripcion(normalizarDescripcion(request.getDescripcion()));
        categoria.setEstado((byte) 1);
        return respuesta(repository.save(categoria));
    }

    @Transactional
    public CategoriaBarRespuesta editar(Integer id, GuardarCategoriaBarRequest request) {
        CategoriaBar categoria = obtener(id);
        String nombre = normalizarNombre(request.getNombre());
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe esa categoría");
        categoria.setNombre(nombre);
        categoria.setDescripcion(normalizarDescripcion(request.getDescripcion()));
        return respuesta(repository.save(categoria));
    }

    @Transactional
    public void desactivar(Integer id) {
        CategoriaBar categoria = obtener(id);
        categoria.setEstado((byte) 0);
        repository.save(categoria);
    }

    private CategoriaBar obtener(Integer id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    private String normalizarNombre(String valor) {
        if (valor == null || valor.isBlank()) throw new IllegalArgumentException("Nombre obligatorio");
        return valor.trim();
    }

    private String normalizarDescripcion(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private CategoriaBarRespuesta respuesta(CategoriaBar categoria) {
        CategoriaBarRespuesta dto = new CategoriaBarRespuesta();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setDescripcion(categoria.getDescripcion());
        dto.setEstado(categoria.getEstado());
        return dto;
    }
}
