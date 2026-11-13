import { Observable } from 'rxjs';
import { MembresiaConSaldo, NuevoPago, Pago } from '../models/pago.model';

/** Contrato qué operaciones existen con los pagos */
export abstract class PagoRepository {
  abstract listarMembresias(): Observable<MembresiaConSaldo[]>;
  abstract listarPorMembresia(membresiaId: number): Observable<Pago[]>;
  abstract registrar(pago: NuevoPago): Observable<Pago>;
}