import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Forma de cada plan de membresía, basada en los flyers reales del gym
interface Plan {
  nombre: string;
  precio: number;
  periodo: string;
  destacado: boolean;
  imagen: string;
  horario: string;
  beneficios: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class Home {

  planes: Plan[] = [
    {
      nombre: 'Plan Mañanero',
      precio: 185,
      periodo: 'Bs / mes',
      destacado: false,
      imagen: '/planes/mananero.jpg',
      horario: 'Acceso de 7:00 AM a 12:00 PM',
      beneficios: [
        'Entrena todos los días',
        'De lunes a domingo',
        'Incluye todos los servicios'
      ]
    },
    {
      nombre: 'Plan Ejecutivo',
      precio: 170,
      periodo: 'Bs / mes',
      destacado: false,
      imagen: '/planes/ejecutivo.jpg',
      horario: 'Lun-Vie 7:00-22:00 · Sáb 8:00-21:00 · Dom 8:00-13:00',
      beneficios: [
        'Entrena 3 veces por semana',
        'Escoge los días de entrenamiento',
        'Incluye todos los servicios'
      ]
    },
    {
      nombre: 'Plan Normal',
      precio: 250,
      periodo: 'Bs / mes',
      destacado: true,
      imagen: '/planes/normal.jpg',
      horario: 'Lun-Vie 7:00-22:00 · Sáb 8:00-21:00 · Dom 8:00-13:00',
      beneficios: [
        'Entrena todos los días',
        'Quédate el tiempo que desees',
        'Incluye todos los servicios'
      ]
    },
    {
      nombre: 'Plan Adulto Mayor',
      precio: 120,
      periodo: 'Bs / mes',
      destacado: false,
      imagen: '/planes/adulto-mayor.jpg',
      horario: 'Yoga, Oxígeno, Folklore y Baile Terapia',
      beneficios: [
        'Yoga: Martes 08:00 / Miércoles 17:00',
        'Oxígeno: Martes y Jueves 16:00',
        'Folklore: Martes, Jueves 19:00 / Viernes 18:00',
        'Baile terapia: Lunes, Miércoles, Viernes 16:00'
      ]
    }
  ];
}