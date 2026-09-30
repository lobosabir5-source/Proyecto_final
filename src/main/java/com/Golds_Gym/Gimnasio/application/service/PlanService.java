package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.GuardarPlanRequest;
import com.Golds_Gym.Gimnasio.application.dto.PlanRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Plan;
import com.Golds_Gym.Gimnasio.domain.repository.PlanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional
    public PlanRespuesta crear(GuardarPlanRequest request) {
        if (planRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new IllegalArgumentException("Ya existe un plan con ese nombre");
        }
        return convertir(planRepository.save(new Plan(
            request.getNombre(), request.getDescripcion(), request.getDuracionDias(), request.getPrecio())));
    }

    @Transactional(readOnly = true)
    public List<PlanRespuesta> listarTodos() {
        return planRepository.findAllByOrderByNombreAsc().stream().map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public List<PlanRespuesta> listarActivos() {
        return planRepository.findByActivoTrueOrderByNombreAsc().stream().map(this::convertir).toList();
    }

    @Transactional
    public PlanRespuesta actualizar(Long id, GuardarPlanRequest request) {
        Plan plan = buscarPorId(id);
        if (!plan.getNombre().equalsIgnoreCase(request.getNombre())
            && planRepository.existsByNombreIgnoreCaseAndIdNot(request.getNombre(), id)) {
            throw new IllegalArgumentException("Ya existe un plan con ese nombre");
        }
        plan.setNombre(request.getNombre());
        plan.setDescripcion(request.getDescripcion());
        plan.setDuracionDias(request.getDuracionDias());
        plan.setPrecio(request.getPrecio());
        return convertir(planRepository.save(plan));
    }

    @Transactional
    public void desactivar(Long id) {
        Plan plan = buscarPorId(id);
        plan.setActivo(false);
    }

    private Plan buscarPorId(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado"));
    }

    private PlanRespuesta convertir(Plan plan) {
        return new PlanRespuesta(
                plan.getId(), plan.getNombre(), plan.getDescripcion(), plan.getDuracionDias(), plan.getPrecio(), plan.isActivo());
    }
}