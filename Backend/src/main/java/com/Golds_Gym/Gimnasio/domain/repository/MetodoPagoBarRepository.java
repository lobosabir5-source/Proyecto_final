package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.MetodoPagoEntidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetodoPagoBarRepository extends JpaRepository<MetodoPagoEntidad, Integer> { }
