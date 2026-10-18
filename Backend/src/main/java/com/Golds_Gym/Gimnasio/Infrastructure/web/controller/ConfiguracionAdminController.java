package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;
import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.ConfiguracionService;
import com.Golds_Gym.Gimnasio.domain.model.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/configuracion")
@PreAuthorize("hasRole('ADMIN')")
public class ConfiguracionAdminController {
 private final ConfiguracionService servicio;
 public ConfiguracionAdminController(ConfiguracionService servicio) {this.servicio=servicio;}
 @GetMapping public ConfiguracionPublicaRespuesta obtener() {return servicio.publico();}
 @PutMapping public ConfiguracionPublicaRespuesta actualizar(@Valid @RequestBody GuardarConfiguracionSolicitud s) {return servicio.guardarGeneral(s);}
 @GetMapping("/telefonos") public List<TelefonoContacto> telefonos() {return servicio.todosTelefonos();}
 @PostMapping("/telefonos") @ResponseStatus(HttpStatus.CREATED) public TelefonoContacto crearTelefono(@Valid @RequestBody GuardarTelefonoSolicitud s) {return servicio.guardarTelefono(null,s);}
 @PutMapping("/telefonos/{id}") public TelefonoContacto editarTelefono(@PathVariable Long id,@Valid @RequestBody GuardarTelefonoSolicitud s) {return servicio.guardarTelefono(id,s);}
 @DeleteMapping("/telefonos/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void borrarTelefono(@PathVariable Long id) {servicio.borrarTelefono(id);}
 @GetMapping("/redes-sociales") public List<RedSocial> redes() {return servicio.todasRedes();}
 @PostMapping("/redes-sociales") @ResponseStatus(HttpStatus.CREATED) public RedSocial crearRed(@Valid @RequestBody GuardarRedSocialSolicitud s) {return servicio.guardarRed(null,s);}
 @PutMapping("/redes-sociales/{id}") public RedSocial editarRed(@PathVariable Long id,@Valid @RequestBody GuardarRedSocialSolicitud s) {return servicio.guardarRed(id,s);}
 @DeleteMapping("/redes-sociales/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void borrarRed(@PathVariable Long id) {servicio.borrarRed(id);}
 @GetMapping("/horarios") public List<HorarioAtencion> horarios() {return servicio.todosHorarios();}
 @PostMapping("/horarios") @ResponseStatus(HttpStatus.CREATED) public HorarioAtencion crearHorario(@Valid @RequestBody GuardarHorarioSolicitud s) {return servicio.guardarHorario(null,s);}
 @PutMapping("/horarios/{id}") public HorarioAtencion editarHorario(@PathVariable Long id,@Valid @RequestBody GuardarHorarioSolicitud s) {return servicio.guardarHorario(id,s);}
 @DeleteMapping("/horarios/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void borrarHorario(@PathVariable Long id) {servicio.borrarHorario(id);}
 @GetMapping("/secciones") public List<SeccionLanding> secciones() {return servicio.todasSecciones();}
 @PostMapping("/secciones") @ResponseStatus(HttpStatus.CREATED) public SeccionLanding crearSeccion(@Valid @RequestBody GuardarSeccionSolicitud s) {return servicio.guardarSeccion(null,s);}
 @PutMapping("/secciones/{id}") public SeccionLanding editarSeccion(@PathVariable Long id,@Valid @RequestBody GuardarSeccionSolicitud s) {return servicio.guardarSeccion(id,s);}
 @DeleteMapping("/secciones/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void borrarSeccion(@PathVariable Long id) {servicio.borrarSeccion(id);}
}
