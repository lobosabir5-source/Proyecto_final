package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long>, JpaSpecificationExecutor<Cliente> {
    boolean existsByNumeroDocumentoAndIdNot(String numeroDocumento,Long id);
    long countByUsuario_ActivoTrue();

    boolean existsByCorreo(String correo);

    boolean existsByCorreoAndIdNot(String correo, Long id);

    Optional<Cliente> findByUsuarioId(Long usuarioId);

    Page<Cliente> findAllByOrderByNombreAsc(Pageable pageable);
}
