package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FotografiaClienteService {
    private final ClienteRepository clientes;
    @Value("${app.uploads.dir:uploads}")
    private String directorio;

    public FotografiaClienteService(ClienteRepository clientes) {
        this.clientes = clientes;
    }

    @Transactional
    public String guardar(Long id, MultipartFile archivo) throws java.io.IOException {
        if (archivo.isEmpty() || archivo.getSize() > 5 * 1024 * 1024)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo vacío o superior a 5MB");
        String tipo = archivo.getContentType();
        String extension;
        if ("image/jpeg".equals(tipo))
            extension = "jpg";
        else if ("image/png".equals(tipo))
            extension = "png";
        else
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo JPEG o PNG");
        var cliente = clientes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        byte[] bytes = archivo.getBytes();
        if (bytes.length < 8 || !(extension.equals("png") && bytes[0] == (byte) 0x89 && bytes[1] == 0x50
                && bytes[2] == 0x4e && bytes[3] == 0x47
                || extension.equals("jpg") && bytes[0] == (byte) 0xff && bytes[1] == (byte) 0xd8))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contenido de imagen inválido");
        Path carpeta = Path.of(directorio, "clientes").toAbsolutePath().normalize();
        Files.createDirectories(carpeta);
        String nombre = UUID.randomUUID() + "." + extension;
        Files.write(carpeta.resolve(nombre), bytes, StandardOpenOption.CREATE_NEW);
        cliente.setFotoUrl("/uploads/clientes/" + nombre);
        return cliente.getFotoUrl();
    }
}
