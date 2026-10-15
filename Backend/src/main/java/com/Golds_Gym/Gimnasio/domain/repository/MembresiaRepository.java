package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.model.Membresia;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface MembresiaRepository extends JpaRepository<Membresia, Long> {
    List<Membresia> findByCliente_IdAndEstadoIn(Long clienteId, Collection<EstadoMembresia> estados);

    Page<Membresia> findAllByOrderByFechaInicioDesc(Pageable pageable);

    Page<Membresia> findAllByCliente_Usuario_IdOrderByFechaInicioDesc(Long usuarioId, Pageable pageable);

    long countByEstadoAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
            EstadoMembresia estado, LocalDate fechaInicio, LocalDate fechaFin);

        long countByEstadoAndFechaFinGreaterThanEqual(EstadoMembresia estado, LocalDate fecha);

    Optional<Membresia> findFirstByCliente_IdAndEstadoAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqualOrderByFechaFinDesc(
            Long clienteId, EstadoMembresia estado, LocalDate fechaInicio, LocalDate fechaFin);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select membresia from Membresia membresia where membresia.id = :id")
    Optional<Membresia> findByIdForUpdate(@Param("id") Long id);

    boolean existsByCliente_Usuario_IdAndCreadaPor_IdAndEstado(Long usuarioId, Long creadaPorId, EstadoMembresia estado);
}