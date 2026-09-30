package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Rutina;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {
    Page<Rutina> findAllByCliente_IdAndActivaTrueOrderByFechaCreacionDesc(Long clienteId, Pageable pageable);

    Page<Rutina> findAllByCliente_Usuario_IdAndActivaTrueOrderByFechaCreacionDesc(Long usuarioId, Pageable pageable);
}