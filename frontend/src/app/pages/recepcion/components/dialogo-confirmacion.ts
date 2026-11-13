import { Component, input, output } from '@angular/core';
import { Boton } from './formulario';

@Component({
  selector: 'app-dialogo-confirmacion',
  standalone: true,
  imports: [Boton],
  template: `
    <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div class="bg-[#111] border border-yellow-500/30 w-full max-w-sm p-6" role="alertdialog" aria-modal="true">
        <p class="mb-6 text-neutral-200">{{ texto() }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" appBoton="secundario" (click)="cancelar.emit()">Cancelar</button>
          <button type="button" appBoton="primario" (click)="confirmar.emit()">Confirmar</button>
        </div>
      </div>
    </div>
  `
})
export class DialogoConfirmacion {
  texto = input.required<string>();
  confirmar = output<void>();
  cancelar = output<void>();
}