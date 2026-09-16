package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class testController     {

    @GetMapping("/api/test")
    public String test() {
        return "Angular puede comunicarse con Spring Boot";
    }
}
