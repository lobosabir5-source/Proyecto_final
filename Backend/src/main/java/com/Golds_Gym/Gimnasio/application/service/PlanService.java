package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.GuardarPlanRequest;
import com.Golds_Gym.Gimnasio.application.dto.PlanRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Plan;
import com.Golds_Gym.Gimnasio.domain.repository.PlanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@Service
public class PlanService {

    private final PlanRepository planRepository;
    private final ImagenPlanService imagenPlanService;

    public PlanService(PlanRepository planRepository, ImagenPlanService imagenPlanService) {
        this.planRepository = planRepository;
        this.imagenPlanService = imagenPlanService;
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
    public PlanRespuesta subirImagen(Long id, MultipartFile archivo) {
        Plan plan = buscarPorId(id);
        String anterior = plan.getImagenUrl();
        plan.setImagenUrl(imagenPlanService.guardar(archivo));
        planRepository.save(plan);
        imagenPlanService.eliminar(anterior);
        return convertir(plan);
    }

    @Transactional
    public PlanRespuesta quitarImagen(Long id) {
        Plan plan = buscarPorId(id);
        String anterior = plan.getImagenUrl();
        plan.setImagenUrl(null);
        planRepository.save(plan);
        imagenPlanService.eliminar(anterior);
        return convertir(plan);
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

    private void aplicarDatosDeLanding(Plan plan, GuardarPlanRequest request) {
        plan.setHorario(request.getHorario());
        plan.setBeneficios(request.getBeneficios().isEmpty() ? null : String.join("\n", request.getBeneficios()));
        plan.setDestacado(request.isDestacado());
        plan.setOrden(request.getOrden());
    }


    private PlanRespuesta convertir(Plan plan) {
        List<String> beneficios = plan.getBeneficios() == null || plan.getBeneficios().isBlank()
                ? List.of()
                : Arrays.stream(plan.getBeneficios().split("\\n")).filter(b -> !b.isBlank()).toList();
        return new PlanRespuesta(
                plan.getId(), plan.getNombre(), plan.getDescripcion(), plan.getDuracionDias(), plan.getPrecio(),
                plan.isActivo(), plan.getHorario(), beneficios, plan.getImagenUrl(), plan.isDestacado(), plan.getOrden());
    }
}