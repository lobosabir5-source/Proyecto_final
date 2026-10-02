package com.Golds_Gym.Gimnasio.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImagenPlanService {

    private static final String PREFIJO_PUBLICO = "/uploads/planes/";
    private static final long TAMANO_MAXIMO = 5L * 1024 * 1024;

    private final Path carpeta;

    public ImagenPlanService(@Value("${app.uploads.dir:uploads}") String directorioBase) {
        this.carpeta = Path.of(directorioBase, "planes").toAbsolutePath().normalize();
    }

    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Selecciona una imagen");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException("La imagen no puede superar 5 MB");
        }

        String extension = detectarExtension(archivo);

        String nombre = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(carpeta); // crea la carpeta si no existe
            try (InputStream entrada = archivo.getInputStream()) {
                Files.copy(entrada, carpeta.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar la imagen", e);
        }
        return PREFIJO_PUBLICO + nombre;
    }

    public void eliminar(String rutaPublica) {
        if (rutaPublica == null || !rutaPublica.startsWith(PREFIJO_PUBLICO)) {
            return;
        }
        Path archivo = carpeta.resolve(rutaPublica.substring(PREFIJO_PUBLICO.length())).normalize();
        if (!archivo.startsWith(carpeta)) {
            return;
        }
        try {
            Files.deleteIfExists(archivo);
        } catch (IOException ignorada) {
        }
    }

    private String detectarExtension(MultipartFile archivo) {
        byte[] cabecera = new byte[12];
        int leidos;
        try (InputStream entrada = archivo.getInputStream()) {
            leidos = entrada.readNBytes(cabecera, 0, cabecera.length);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer la imagen", e);
        }

        if (leidos >= 3 && (cabecera[0] & 0xFF) == 0xFF && (cabecera[1] & 0xFF) == 0xD8 && (cabecera[2] & 0xFF) == 0xFF) {
            return ".jpg";
        }
        if (leidos >= 8 && (cabecera[0] & 0xFF) == 0x89 && cabecera[1] == 'P' && cabecera[2] == 'N' && cabecera[3] == 'G') {
            return ".png";
        }
        if (leidos >= 12 && cabecera[0] == 'R' && cabecera[1] == 'I' && cabecera[2] == 'F' && cabecera[3] == 'F'
                && cabecera[8] == 'W' && cabecera[9] == 'E' && cabecera[10] == 'B' && cabecera[11] == 'P') {
            return ".webp";
        }
        throw new IllegalArgumentException("Formato no permitido. Usa JPG, PNG o WEBP");
    }
}