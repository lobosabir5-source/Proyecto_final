package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class RegistroRequest {

	@NotBlank(message = "El usuario es obligatorio")
	@Size(max = 80, message = "El usuario no puede superar 80 caracteres")
	private String usuario;
	@NotBlank(message = "La contraseña es obligatoria")
	@Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
	private String password;
	@NotBlank(message = "El nombre es obligatorio")
	@Size(max = 120, message = "El nombre no puede superar 120 caracteres")
	private String nombre;
	@NotBlank(message = "El correo es obligatorio")
	@Email(message = "El correo no tiene un formato válido")
	@Size(max = 160, message = "El correo no puede superar 160 caracteres")
	private String correo;
	@NotBlank(message = "El teléfono es obligatorio")
	@Pattern(regexp = "^[+0-9 ()-]{7,30}$", message = "El teléfono no tiene un formato válido")
	private String telefono;
	@NotNull(message = "La fecha de nacimiento es obligatoria")
	@Past(message = "La fecha de nacimiento debe ser anterior a hoy")
	private LocalDate fechaNacimiento;

	public RegistroRequest() {
	}

	public String getUsuario() { return usuario; }
	public void setUsuario(String usuario) { this.usuario = usuario == null ? null : usuario.trim(); }
	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }
	public String getNombre() { return nombre; }
	public void setNombre(String nombre) { this.nombre = nombre == null ? null : nombre.trim(); }
	public String getCorreo() { return correo; }
	public void setCorreo(String correo) { this.correo = correo == null ? null : correo.trim().toLowerCase(); }
	public String getTelefono() { return telefono; }
	public void setTelefono(String telefono) { this.telefono = telefono == null ? null : telefono.trim(); }
	public LocalDate getFechaNacimiento() { return fechaNacimiento; }
	public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
}
