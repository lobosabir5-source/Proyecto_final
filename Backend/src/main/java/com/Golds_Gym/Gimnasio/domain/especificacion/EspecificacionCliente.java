package com.Golds_Gym.Gimnasio.domain.especificacion;

import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class EspecificacionCliente {
    private EspecificacionCliente() {
    }

    public static Specification<Cliente> filtrar(Long id, String nombre, String correo, String telefono, String usuario,
            Boolean activo, LocalDate nacimiento, LocalDate alta) {
        return (raiz, consulta, criterios) -> {
            List<Predicate> filtros = new ArrayList<>();
            if (id != null)
                filtros.add(criterios.equal(raiz.get("id"), id));
            if (texto(nombre))
                filtros.add(criterios.like(criterios.lower(raiz.get("nombre")), patron(nombre), '\\'));
            if (texto(correo))
                filtros.add(criterios.like(criterios.lower(raiz.get("correo")), patron(correo), '\\'));
            if (texto(telefono))
                filtros.add(criterios.like(raiz.get("telefono"), patron(telefono), '\\'));
            if (texto(usuario))
                filtros.add(
                        criterios.like(criterios.lower(raiz.join("usuario").get("usuario")), patron(usuario), '\\'));
            if (activo != null)
                filtros.add(criterios.equal(raiz.join("usuario").get("activo"), activo));
            if (nacimiento != null)
                filtros.add(criterios.equal(raiz.get("fechaNacimiento"), nacimiento));
            if (alta != null)
                filtros.add(criterios.equal(raiz.get("fechaAlta"), alta));
            return criterios.and(filtros.toArray(new Predicate[0]));
        };
    }

    private static boolean texto(String v) {
        return v != null && !v.isBlank();
    }

    private static String patron(String v) {
        return "%" + v.trim().toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
                + "%";
    }
}
