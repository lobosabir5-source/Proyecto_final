package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.RegistroRequest;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodigoRegistroService {
    private static final long EXPIRACION_SEGUNDOS = 300;
    private static final long ESPERA_REENVIO_SEGUNDOS = 30;
    private static final int MAX_INTENTOS = 5;

    private final ConcurrentHashMap<String, Desafio> desafios = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String remitente;

    public CodigoRegistroService(ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.auth.email-from:}") String remitente) {
        this.mailSender = mailSender;
        this.remitente = remitente;
    }

    public void enviar(RegistroRequest registro) {
        String correo = registro.getCorreo();
        long ahora = Instant.now().getEpochSecond();
        Desafio anterior = desafios.get(correo);
        if (anterior != null && anterior.huellaRegistro().equals(huella(registro))
                && ahora - anterior.enviadoEn() < ESPERA_REENVIO_SEGUNDOS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Espera un minuto antes de solicitar otro código.");
        }

        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || remitente.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El envío de correos no está configurado. Contacta al gimnasio.");
        }

        String codigo = String.format("%06d", random.nextInt(1_000_000));
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(remitente);
        mensaje.setTo(correo);
        mensaje.setSubject("Tu código de verificación | Gold's Fitness");
        mensaje.setText("Hola " + registro.getNombre() + ",\n\n"
                + "Tu código para completar el registro en Gold's Fitness es: " + codigo + "\n\n"
                + "Vence en 10 minutos. Si no solicitaste este código, puedes ignorar este correo.");
        try {
            sender.send(mensaje);
        } catch (MailException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo enviar el correo. Comprueba que la dirección Gmail esté correcta e inténtalo de nuevo.");
        }
        desafios.put(correo, new Desafio(hash(codigo), huella(registro), ahora, ahora + EXPIRACION_SEGUNDOS, 0));
    }

    public void validar(RegistroRequest registro, String codigo) {
        String correo = registro.getCorreo();
        Desafio desafio = desafios.get(correo);
        long ahora = Instant.now().getEpochSecond();
        if (desafio == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solicita primero un código de verificación.");
        }
        if (ahora > desafio.venceEn()) {
            desafios.remove(correo, desafio);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código venció. Solicita uno nuevo.");
        }
        if (desafio.intentos() >= MAX_INTENTOS) {
            desafios.remove(correo, desafio);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Se superó el número de intentos. Solicita un nuevo código.");
        }
        if (!MessageDigest.isEqual(desafio.huellaRegistro().getBytes(StandardCharsets.US_ASCII),
                huella(registro).getBytes(StandardCharsets.US_ASCII))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los datos cambiaron. Solicita un código nuevo para este registro.");
        }
        if (!MessageDigest.isEqual(desafio.hashCodigo().getBytes(StandardCharsets.US_ASCII),
                hash(codigo).getBytes(StandardCharsets.US_ASCII))) {
            desafios.computeIfPresent(correo, (clave, actual) -> actual.conIntentoMas());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código ingresado no es correcto.");
        }
        desafios.remove(correo, desafio);
    }

    private String huella(RegistroRequest registro) {
        String datos = String.join("\u0000", registro.getUsuario(), registro.getPassword(), registro.getNombre(),
                registro.getCorreo(), registro.getTelefono(), registro.getFechaNacimiento().toString(),
                registro.getPlanId().toString());
        return hash(datos);
    }

    private String hash(String valor) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
    }

    private record Desafio(String hashCodigo, String huellaRegistro, long enviadoEn, long venceEn, int intentos) {
        private Desafio conIntentoMas() {
            return new Desafio(hashCodigo, huellaRegistro, enviadoEn, venceEn, intentos + 1);
        }
    }
}
