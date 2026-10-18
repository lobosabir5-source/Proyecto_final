package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Comparator;
import java.util.List;

@Service
public class ConfiguracionService {
  private static final Long ID_SEDE_UNICA = 1L;
  private final ConfiguracionGimnasioRepository configuraciones;
  private final TelefonoContactoRepository telefonos;
  private final RedSocialRepository redes;
  private final HorarioAtencionRepository horarios;
  private final SeccionLandingRepository secciones;

  public ConfiguracionService(ConfiguracionGimnasioRepository c, TelefonoContactoRepository t,
      RedSocialRepository r, HorarioAtencionRepository h, SeccionLandingRepository s) {
    configuraciones = c;
    telefonos = t;
    redes = r;
    horarios = h;
    secciones = s;
  }

  private ConfiguracionGimnasio entidad() {
    return configuraciones.findById(ID_SEDE_UNICA).orElseGet(() -> {
      ConfiguracionGimnasio c = new ConfiguracionGimnasio();
      c.setId(ID_SEDE_UNICA);
      c.setNombreComercial("Gold's Gym");
      return c;
    });
  }

  @Transactional(readOnly = true)
  public ConfiguracionPublicaRespuesta publico() {
    ConfiguracionGimnasio c = entidad();
    List<ConfiguracionPublicaRespuesta.Telefono> t = telefonos.findAll().stream().filter(TelefonoContacto::isActivo)
        .sorted(Comparator.comparingInt(TelefonoContacto::getOrden))
        .map(x -> new ConfiguracionPublicaRespuesta.Telefono(x.getId(), x.getNumero(), x.getEtiqueta(), x.isWhatsapp(),
            x.isPrincipal(), x.getOrden()))
        .toList();
    List<ConfiguracionPublicaRespuesta.Red> r = redes.findAll().stream().filter(RedSocial::isActivo)
        .sorted(Comparator.comparingInt(RedSocial::getOrden))
        .map(x -> new ConfiguracionPublicaRespuesta.Red(x.getId(), x.getPlataforma(), x.getUrl(), x.getNombreUsuario(),
            x.getIcono(), x.getOrden()))
        .toList();
    List<ConfiguracionPublicaRespuesta.Horario> h = horarios.findAll().stream()
        .sorted(Comparator.comparing(HorarioAtencion::getDiaSemana))
        .map(x -> new ConfiguracionPublicaRespuesta.Horario(x.getId(), x.getDiaSemana(), x.getApertura(), x.getCierre(),
            x.isCerrado()))
        .toList();
    List<ConfiguracionPublicaRespuesta.Seccion> s = secciones.findAll().stream().filter(SeccionLanding::isVisible)
        .sorted(Comparator.comparingInt(SeccionLanding::getOrden))
        .map(x -> new ConfiguracionPublicaRespuesta.Seccion(x.getId(), x.getClave(), x.getTitulo(), x.getContenido(),
            x.getImagenUrl(), x.getOrden()))
        .toList();
    return new ConfiguracionPublicaRespuesta(c.getId(), c.getNombreComercial(), c.getCorreoContacto(),
        c.getDescripcion(), c.getDireccion(),
        c.getLogoUrl(), c.getPortadaUrl(), c.getColorPrimario(), c.getColorSecundario(), t, r, h, s);
  }

  @Transactional
  public ConfiguracionPublicaRespuesta guardarGeneral(GuardarConfiguracionSolicitud s) {
    ConfiguracionGimnasio c = entidad();
    c.setNombreComercial(s.nombreComercial().trim());
    c.setCorreoContacto(s.correoContacto());
    c.setDescripcion(s.descripcion());
    c.setDireccion(s.direccion());
    c.setLogoUrl(s.logoUrl());
    c.setPortadaUrl(s.portadaUrl());
    c.setColorPrimario(s.colorPrimario());
    c.setColorSecundario(s.colorSecundario());
    configuraciones.save(c);
    return publico();
  }

  private ResponseStatusException noExiste() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro no encontrado");
  }

  @Transactional
  public TelefonoContacto guardarTelefono(Long id, GuardarTelefonoSolicitud s) {
    TelefonoContacto t = id == null ? new TelefonoContacto() : telefonos.findById(id).orElseThrow(this::noExiste);
    if (s.principal())
      telefonos.findAll().stream().filter(x -> x.isPrincipal() && !x.getId().equals(id))
          .forEach(x -> x.setPrincipal(false));
    t.setNumero(s.numero().trim());
    t.setEtiqueta(s.etiqueta());
    t.setWhatsapp(s.whatsapp());
    t.setPrincipal(s.principal());
    t.setActivo(s.activo());
    t.setOrden(s.orden());
    return telefonos.save(t);
  }

  @Transactional
  public void borrarTelefono(Long id) {
    if (!telefonos.existsById(id))
      throw noExiste();
    telefonos.deleteById(id);
  }

  @Transactional
  public RedSocial guardarRed(Long id, GuardarRedSocialSolicitud s) {
    RedSocial r = id == null ? new RedSocial() : redes.findById(id).orElseThrow(this::noExiste);
    r.setPlataforma(s.plataforma().trim());
    r.setUrl(s.url().trim());
    r.setNombreUsuario(s.nombreUsuario());
    r.setIcono(s.icono());
    r.setActivo(s.activo());
    r.setOrden(s.orden());
    return redes.save(r);
  }

  @Transactional
  public void borrarRed(Long id) {
    if (!redes.existsById(id))
      throw noExiste();
    redes.deleteById(id);
  }

  @Transactional
  public HorarioAtencion guardarHorario(Long id, GuardarHorarioSolicitud s) {
    if (!s.cerrado() && (s.apertura() == null || s.cierre() == null || !s.apertura().isBefore(s.cierre())))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horario inválido");
    if (horarios.findAll().stream().anyMatch(x -> x.getDiaSemana().equals(s.diaSemana()) && !x.getId().equals(id)))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe horario para ese día");
    HorarioAtencion h = id == null ? new HorarioAtencion() : horarios.findById(id).orElseThrow(this::noExiste);
    h.setDiaSemana(s.diaSemana());
    h.setCerrado(s.cerrado());
    h.setApertura(s.cerrado() ? null : s.apertura());
    h.setCierre(s.cerrado() ? null : s.cierre());
    return horarios.save(h);
  }

  @Transactional
  public void borrarHorario(Long id) {
    if (!horarios.existsById(id))
      throw noExiste();
    horarios.deleteById(id);
  }

  @Transactional
  public SeccionLanding guardarSeccion(Long id, GuardarSeccionSolicitud s) {
    if (secciones.findAll().stream().anyMatch(x -> x.getClave().equals(s.clave()) && !x.getId().equals(id)))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Clave de sección duplicada");
    SeccionLanding x = id == null ? new SeccionLanding() : secciones.findById(id).orElseThrow(this::noExiste);
    x.setClave(s.clave());
    x.setTitulo(s.titulo());
    x.setContenido(s.contenido());
    x.setImagenUrl(s.imagenUrl());
    x.setVisible(s.visible());
    x.setOrden(s.orden());
    return secciones.save(x);
  }

  @Transactional
  public void borrarSeccion(Long id) {
    if (!secciones.existsById(id))
      throw noExiste();
    secciones.deleteById(id);
  }

  @Transactional(readOnly = true)
  public List<TelefonoContacto> todosTelefonos() {
    return telefonos.findAll();
  }

  @Transactional(readOnly = true)
  public List<RedSocial> todasRedes() {
    return redes.findAll();
  }

  @Transactional(readOnly = true)
  public List<HorarioAtencion> todosHorarios() {
    return horarios.findAll();
  }

  @Transactional(readOnly = true)
  public List<SeccionLanding> todasSecciones() {
    return secciones.findAll();
  }
}
