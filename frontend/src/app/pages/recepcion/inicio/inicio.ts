import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResumenRecepcion } from '../../../models/recepcion.models';
import { MembresiaRecepcionService } from '../../../services/membresia-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './inicio.html'
})
export class InicioComponent implements OnInit {
  private readonly api = inject(MembresiaRecepcionService);
  readonly resumen = signal<ResumenRecepcion | null>(null);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.resumen().subscribe({
      next: r => this.resumen.set(r),
      error: e => this.error.set(leerErrorApi(e).mensaje)
    });
  }
}