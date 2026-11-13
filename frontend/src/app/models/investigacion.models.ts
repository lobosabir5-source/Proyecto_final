export interface ColasRequest {
  tasaLlegadas: number;
  tasaServicio: number;
  servidores: number;
  clientes: number;
  capacidadSistema?: number | null;
}

export interface ColasRespuesta {
  modelo: string;
  servidores: number;
  capacidadSistema: number | null;
  probabilidadBloqueo: number | null;
  tasaLlegadasEfectiva: number | null;
  tasaClientesRechazados: number | null;
  utilizacion: number;
  probabilidadSistemaVacio: number;
  probabilidadEsperar: number;
  probabilidadNClientes: number;
  clientesPromedioCola: number;
  clientesPromedioSistema: number;
  tiempoPromedioColaMinutos: number;
  tiempoPromedioSistemaMinutos: number;
}

export interface EoqRequest {
  demandaAnual: number;
  costoPorPedido: number;
  costoMantenimientoAnual: number;
}

export interface EoqRespuesta {
  cantidadEconomica: number;
  cantidadSugeridaUnidades: number;
  pedidosPorAnio: number;
  diasEntrePedidos: number;
  costoAnualPedidos: number;
  costoAnualMantenimiento: number;
  costoAnualRelevante: number;
}