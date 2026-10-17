package com.Golds_Gym.Gimnasio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class UploadsConfig implements WebMvcConfigurer {

    private final Path directorio;

    public UploadsConfig(@Value("${app.uploads.dir:uploads}") String directorioBase) {
        this.directorio = Path.of(directorioBase).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String ubicacion = directorio.toUri().toString();
        if (!ubicacion.endsWith("/")) {
            ubicacion += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(ubicacion)
                .setCachePeriod(3600);
    }
}