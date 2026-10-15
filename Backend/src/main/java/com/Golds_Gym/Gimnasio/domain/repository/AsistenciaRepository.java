package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Asistencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    boolean existsByCliente_IdAndFecha(Long clienteId, LocalDate fecha);

    Page<Asistencia> findAllByFechaOrderByHoraEntradaDesc(LocalDate fecha, Pageable pageable);

    Page<Asistencia> findAllByCliente_Usuario_IdOrderByHoraEntradaDesc(Long usuarioId, Pageable pageable);

    long countByFecha(LocalDate fecha);
}