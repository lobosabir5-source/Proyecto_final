package com.Golds_Gym.Gimnasio;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AutorizacionPorRolTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void recepcionistaPuedeListarClientes() throws Exception {
        mockMvc.perform(get("/api/recepcion/clientes")
                        .with(user("recepcionista").roles("RECEPCIONISTA")))
                .andExpect(status().isOk());
    }

    @Test
    void clienteNoPuedeListarClientesDeOtros() throws Exception {
        mockMvc.perform(get("/api/recepcion/clientes")
                        .with(user("cliente").roles("CLIENTE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void recepcionistaNoPuedeConsultarReportesAdministrativos() throws Exception {
        mockMvc.perform(get("/api/admin/reportes/resumen")
                        .with(user("recepcionista").roles("RECEPCIONISTA")))
                .andExpect(status().isForbidden());
    }

    @Test
    void clientePuedeConsultarCatalogoDePlanes() throws Exception {
        mockMvc.perform(get("/api/cliente/planes")
                        .with(user("cliente").roles("CLIENTE")))
                .andExpect(status().isOk());
    }
}