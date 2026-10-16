package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.HistorialMembresia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialMembresiaRepository extends JpaRepository<HistorialMembresia, Long> {
    List<HistorialMembresia> findByMembresia_Cliente_IdOrderByFechaOperacionDesc(Long clienteId);
}
