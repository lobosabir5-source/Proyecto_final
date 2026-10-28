package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.CategoriaBar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaBarRepository extends JpaRepository<CategoriaBar, Integer> {
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);
}
