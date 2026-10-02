import { Component, inject } from '@angular/core';
import { RecepcionService } from '../../../services/recepcion.service';

@Component({
  selector: 'app-planes',
  standalone: true,
  templateUrl: './planes.html'
})
export class PlanesComponent {
  srv = inject(RecepcionService);
}