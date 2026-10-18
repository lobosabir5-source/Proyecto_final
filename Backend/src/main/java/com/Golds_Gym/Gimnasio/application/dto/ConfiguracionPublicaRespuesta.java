package com.Golds_Gym.Gimnasio.application.dto;
import java.time.LocalTime;
import java.util.List;
public record ConfiguracionPublicaRespuesta(
 Long id, String nombreComercial, String correoContacto, String descripcion, String direccion,
 String logoUrl, String portadaUrl, String colorPrimario, String colorSecundario,
 List<Telefono> telefonos, List<Red> redesSociales, List<Horario> horarios, List<Seccion> secciones) {
 public record Telefono(Long id,String numero,String etiqueta,boolean whatsapp,boolean principal,int orden) {}
 public record Red(Long id,String plataforma,String url,String nombreUsuario,String icono,int orden) {}
 public record Horario(Long id,Integer diaSemana,LocalTime apertura,LocalTime cierre,boolean cerrado) {}
 public record Seccion(Long id,String clave,String titulo,String contenido,String imagenUrl,int orden) {}
}
