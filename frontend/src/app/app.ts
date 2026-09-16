import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  mensaje = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('http://localhost:8080/api/test', {
      responseType: 'text'
    }).subscribe({

      next: (respuesta) => {
        this.mensaje = respuesta;
      },

      error: (error) => {
        console.error('Error:', error);
        this.mensaje = 'Error al conectar con Spring Boot';
      }

    });
  }
}
