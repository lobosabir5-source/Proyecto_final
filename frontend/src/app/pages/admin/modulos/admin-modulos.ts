import { Component } from '@angular/core';
import { CrudPage, CrudCfg } from '../../../shared/ui/crud-page/crud-page';
import { PagosComponent } from '../../recepcion/pagos/pagos';
import { CajaComponent } from '../../recepcion/caja/caja';

const f = (v: any) => (v ? String(v) : '—');
const hora = (v: any) => (v ? String(v).slice(0, 5) : '—');
const op = (...v: string[]) => v.map(x => ({ valor: x, etiqueta: x.charAt(0) + x.slice(1).toLowerCase().replace(/_/g, ' ') }));
const DIAS = op('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY').map((o, i) => ({
  valor: o.valor, etiqueta: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i],
}));
const personalRemoto = {
  ruta: '/admin/personal',
  valor: (p: any) => String(p.id),
  etiqueta: (p: any) => `${p.nombres} ${p.apellidos} (${p.cargo})`,
};
const ids = (v: Record<string, any>, ...k: string[]) => { const r = { ...v }; k.forEach(x => (r[x] = r[x] == null ? null : Number(r[x]))); return r; };
// ---------- PAGOS Y CAJA (reutiliza las pantallas de recepción; el backend permite ADMIN) ----------
@Component({ selector: 'app-admin-pagos', imports: [PagosComponent], template: `<div class="overflow-hidden rounded-xl bg-neutral-950 text-white"><app-pagos /></div>` })
export class AdminPagos {}

@Component({ selector: 'app-admin-caja', imports: [CajaComponent], template: `<app-caja />` })
export class AdminCaja {}

// ---------- SECCIONES DEL SITIO (Nosotros y Galería de la página pública) ----------
@Component({ selector: 'app-admin-secciones', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminSecciones {
  cfg: CrudCfg = {
    titulo: 'Secciones del sitio', subtitulo: 'Textos de "Nosotros" y fotos de la "Galería" de la página pública', singular: 'sección',
    ruta: '/admin/configuracion/secciones', puedeEliminar: true,
    campos: [
      { key: 'clave', label: 'Clave (nosotros, galeria1, galeria2...)', tipo: 'text', requerido: true, max: 80 },
      { key: 'titulo', label: 'Título', tipo: 'text', max: 150 },
      { key: 'contenido', label: 'Contenido', tipo: 'textarea', max: 4000 },
      { key: 'imagenUrl', label: 'URL de la imagen (https://...)', tipo: 'text', max: 500 },
      { key: 'visible', label: 'Visible', tipo: 'select', requerido: true, opciones: [{ valor: 'true', etiqueta: 'Sí' }, { valor: 'false', etiqueta: 'No' }] },
      { key: 'orden', label: 'Orden', tipo: 'number', requerido: true, min: 0 },
    ],
    columnas: [
      { key: 'clave', label: 'Clave' }, { key: 'titulo', label: 'Título', fmt: f },
      { key: 'imagenUrl', label: 'Imagen', fmt: v => (v ? 'Sí' : '—') },
      { key: 'visible', label: 'Visible' }, { key: 'orden', label: 'Orden' },
    ],
    aCuerpo: v => ({ ...v, visible: v['visible'] !== 'false', orden: Number(v['orden'] ?? 0) }),
    deFila: r => ({ ...r, visible: String(r.visible !== false) }),
  };
}

// ---------- CLIENTES ----------
@Component({ selector: 'app-admin-clientes', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminClientes {
  cfg: CrudCfg = {
    titulo: 'Clientes', subtitulo: 'Registro, búsqueda y edición de clientes', singular: 'cliente',
    ruta: '/recepcion/clientes', paramBusqueda: 'texto', puedeEliminar: true,
    campos: [
      { key: 'usuario', label: 'Usuario', tipo: 'text', requerido: true, soloCrear: true, max: 80 },
      { key: 'password', label: 'Contraseña (mín. 8)', tipo: 'password', requerido: true, soloCrear: true, minLen: 8, max: 100 },
      { key: 'nombre', label: 'Nombre completo', tipo: 'text', requerido: true, max: 120 },
      { key: 'correo', label: 'Correo', tipo: 'email', requerido: true, max: 160 },
      { key: 'telefono', label: 'Teléfono', tipo: 'text', requerido: true, max: 30 },
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento', tipo: 'date', requerido: true },
    ],
    columnas: [
      { key: 'nombre', label: 'Nombre' }, { key: 'correo', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' }, { key: 'fechaNacimiento', label: 'Nacimiento', fmt: f },
      { key: 'activo', label: 'Activo', fmt: v => (v === false ? 'No' : 'Sí') },
    ],
    aCuerpo: v => { const c: any = { ...v }; if (!c.usuario) delete c.usuario; if (!c.password) delete c.password; return c; },
  };
}

// ---------- PERSONAL ----------
@Component({ selector: 'app-admin-personal', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminPersonal {
  cfg: CrudCfg = {
    titulo: 'Personal', subtitulo: 'Empleados y cargos del gimnasio', singular: 'empleado',
    ruta: '/admin/personal', paramBusqueda: 'texto', puedeEliminar: false,
    filtros: [
      { param: 'cargo', label: 'Cargo', opciones: op('ADMINISTRATIVO', 'INSTRUCTOR', 'LIMPIEZA') },
      { param: 'estado', label: 'Estado', opciones: op('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'RETIRADO') },
    ],
    campos: [
      { key: 'nombres', label: 'Nombres', tipo: 'text', requerido: true, max: 100 },
      { key: 'apellidos', label: 'Apellidos', tipo: 'text', requerido: true, max: 100 },
      { key: 'documento', label: 'Documento', tipo: 'text', requerido: true, max: 30 },
      { key: 'telefono', label: 'Teléfono', tipo: 'text', max: 30 },
      { key: 'correo', label: 'Correo', tipo: 'email', max: 150 },
      { key: 'cargo', label: 'Cargo', tipo: 'select', requerido: true, opciones: op('ADMINISTRATIVO', 'INSTRUCTOR', 'LIMPIEZA') },
      { key: 'fechaIngreso', label: 'Fecha de ingreso', tipo: 'date', requerido: true },
      { key: 'observaciones', label: 'Observaciones', tipo: 'textarea', max: 500 },
    ],
    columnas: [
      { key: 'nombres', label: 'Nombre', fmt: (_, r) => `${r.nombres} ${r.apellidos}` },
      { key: 'documento', label: 'Documento' }, { key: 'cargo', label: 'Cargo' },
      { key: 'telefono', label: 'Teléfono', fmt: f }, { key: 'estadoLaboral', label: 'Estado' },
      { key: 'fechaIngreso', label: 'Ingreso', fmt: f },
    ],
    acciones: [
      { etiqueta: 'Dar de baja', visible: r => r.estadoLaboral === 'ACTIVO', ruta: r => `/admin/personal/${r.id}/estado`,
        cuerpo: () => ({ estadoLaboral: 'INACTIVO' }), confirmar: '¿Dar de baja a este empleado?', exito: 'Empleado dado de baja.',
        clase: 'rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700' },
      { etiqueta: 'Reactivar', visible: r => r.estadoLaboral !== 'ACTIVO', ruta: r => `/admin/personal/${r.id}/estado`,
        cuerpo: () => ({ estadoLaboral: 'ACTIVO' }), confirmar: '¿Reactivar a este empleado?', exito: 'Empleado reactivado.' },
    ],
  };
}

// ---------- ASISTENCIA DEL PERSONAL ----------
@Component({ selector: 'app-admin-asistencia-personal', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminAsistenciaPersonal {
  cfg: CrudCfg = {
    titulo: 'Asistencia del personal', subtitulo: 'Registro de asistencia por turnos', singular: 'asistencia',
    ruta: '/admin/asistencias-personal', puedeEliminar: true,
    campos: [
      { key: 'personalId', label: 'Empleado', tipo: 'select', requerido: true, opcionesRemotas: personalRemoto },
      { key: 'fecha', label: 'Fecha', tipo: 'date', requerido: true },
      { key: 'turno', label: 'Turno', tipo: 'select', requerido: true, opciones: op('MANANA', 'TARDE', 'NOCHE') },
      { key: 'estado', label: 'Estado', tipo: 'select', requerido: true, opciones: op('PRESENTE', 'RETRASO', 'AUSENTE', 'PERMISO') },
      { key: 'horaEntrada', label: 'Hora de entrada', tipo: 'time' },
      { key: 'horaSalida', label: 'Hora de salida', tipo: 'time' },
      { key: 'observaciones', label: 'Observaciones', tipo: 'textarea', max: 500 },
    ],
    columnas: [
      { key: 'nombreCompleto', label: 'Empleado' }, { key: 'cargo', label: 'Cargo' },
      { key: 'fecha', label: 'Fecha' }, { key: 'turno', label: 'Turno' }, { key: 'estado', label: 'Estado' },
      { key: 'horaEntrada', label: 'Entrada', fmt: hora }, { key: 'horaSalida', label: 'Salida', fmt: hora },
    ],
    aCuerpo: v => ids(v, 'personalId'),
    deFila: r => ({ ...r, personalId: String(r.personalId), horaEntrada: r.horaEntrada?.slice(0, 5) ?? '', horaSalida: r.horaSalida?.slice(0, 5) ?? '' }),
  };
}

// ---------- INVENTARIO GENERAL ----------
@Component({ selector: 'app-admin-inventario', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminInventario {
  cfg: CrudCfg = {
    titulo: 'Inventario general', subtitulo: 'Materiales, existencias y mínimos', singular: 'insumo',
    ruta: '/admin/inventario-general', paramBusqueda: 'nombre', puedeEliminar: true,
    filtros: [{ param: 'categoria', label: 'Categoría', opciones: op('LIMPIEZA', 'BEBIDA', 'LACTEO', 'OTRO') }],
    campos: [
      { key: 'nombre', label: 'Nombre', tipo: 'text', requerido: true, max: 120 },
      { key: 'categoria', label: 'Categoría', tipo: 'select', requerido: true, opciones: op('LIMPIEZA', 'BEBIDA', 'LACTEO', 'OTRO') },
      { key: 'unidad', label: 'Unidad', tipo: 'select', requerido: true, opciones: op('UNIDAD', 'LITRO', 'MILILITRO', 'KILOGRAMO', 'GRAMO', 'PAQUETE') },
      { key: 'minimo', label: 'Existencia mínima', tipo: 'number', requerido: true, min: 0 },
      { key: 'descripcion', label: 'Descripción', tipo: 'text', max: 255 },
    ],
    columnas: [
      { key: 'nombre', label: 'Insumo' }, { key: 'categoria', label: 'Categoría' }, { key: 'unidad', label: 'Unidad' },
      { key: 'existencia', label: 'Existencia' }, { key: 'minimo', label: 'Mínimo' },
      { key: 'alertaMinimo', label: 'Stock', fmt: v => (v ? 'Bajo mínimo' : 'OK') },
    ],
  };
}

// ---------- EQUIPOS ----------
@Component({ selector: 'app-admin-equipos', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminEquipos {
  cfg: CrudCfg = {
    titulo: 'Equipos', subtitulo: 'Equipos del gimnasio, estado y mantenimiento', singular: 'equipo',
    ruta: '/admin/mantenimiento-equipos/equipos', paramBusqueda: 'texto', puedeEliminar: false,
    filtros: [{ param: 'estado', label: 'Estado', opciones: op('OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO') }],
    campos: [
      { key: 'codigo', label: 'Código', tipo: 'text', requerido: true, max: 40 },
      { key: 'nombre', label: 'Nombre', tipo: 'text', requerido: true, max: 120 },
      { key: 'tipo', label: 'Tipo', tipo: 'text', requerido: true, max: 60 },
      { key: 'ubicacion', label: 'Ubicación', tipo: 'text', max: 120 },
      { key: 'estado', label: 'Estado', tipo: 'select', opciones: op('OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO') },
      { key: 'descripcion', label: 'Descripción', tipo: 'textarea', max: 500 },
      { key: 'diaUno', label: 'Día de mantenimiento 1', tipo: 'select', opciones: DIAS },
      { key: 'diaDos', label: 'Día de mantenimiento 2', tipo: 'select', opciones: DIAS },
      { key: 'tecnicoId', label: 'Técnico', tipo: 'select', opcionesRemotas: personalRemoto },
      { key: 'fechaAlta', label: 'Fecha de alta', tipo: 'date' },
    ],
    columnas: [
      { key: 'codigo', label: 'Código' }, { key: 'nombre', label: 'Equipo' }, { key: 'tipo', label: 'Tipo' },
      { key: 'ubicacion', label: 'Ubicación', fmt: f }, { key: 'estado', label: 'Estado' },
      { key: 'tecnicoId', label: 'Técnico', refCampo: 'tecnicoId' },
      { key: 'mantenimientoActivo', label: 'Mant. activo' },
    ],
    aCuerpo: v => ids(v, 'tecnicoId'),
    deFila: r => ({ ...r, tecnicoId: r.tecnicoId == null ? '' : String(r.tecnicoId) }),
  };
}

// ---------- MANTENIMIENTO ----------
@Component({ selector: 'app-admin-mantenimiento', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminMantenimiento {
  cfg: CrudCfg = {
    titulo: 'Mantenimiento', subtitulo: 'Programación de mantenimientos y asignación de técnicos', singular: 'mantenimiento',
    ruta: '/admin/mantenimiento-equipos/registros', puedeEditar: false,
    filtros: [{ param: 'estado', label: 'Estado', opciones: op('PENDIENTE', 'REALIZADO', 'CANCELADO') }],
    campos: [
      { key: 'equipoId', label: 'Equipo', tipo: 'select', requerido: true,
        opcionesRemotas: { ruta: '/admin/mantenimiento-equipos/equipos', valor: (e: any) => String(e.id), etiqueta: (e: any) => `${e.codigo} - ${e.nombre}` } },
      { key: 'fechaProgramada', label: 'Fecha programada', tipo: 'date', requerido: true },
      { key: 'tecnicoId', label: 'Técnico', tipo: 'select', opcionesRemotas: personalRemoto },
      { key: 'observaciones', label: 'Observaciones', tipo: 'textarea', max: 1000 },
    ],
    columnas: [
      { key: 'equipoId', label: 'Equipo', refCampo: 'equipoId' },
      { key: 'fechaProgramada', label: 'Programada', fmt: f }, { key: 'fechaRealizada', label: 'Realizada', fmt: f },
      { key: 'estado', label: 'Estado', fmt: (v, r) => (r.vencido ? `${v} (vencido)` : String(v)) },
      { key: 'tecnicoId', label: 'Técnico', refCampo: 'tecnicoId' },
    ],
    acciones: [
      { etiqueta: 'Completar', visible: r => r.estado === 'PENDIENTE', ruta: r => `/admin/mantenimiento-equipos/registros/${r.id}/completar`, exito: 'Mantenimiento completado.', confirmar: '¿Marcar como realizado?' },
      { etiqueta: 'Cancelar', visible: r => r.estado === 'PENDIENTE', ruta: r => `/admin/mantenimiento-equipos/registros/${r.id}/cancelar`, exito: 'Mantenimiento cancelado.', confirmar: '¿Cancelar este mantenimiento?', clase: 'rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700' },
    ],
    aCuerpo: v => ids(v, 'equipoId', 'tecnicoId'),
  };
}

// ---------- AERÓBICOS ----------
@Component({ selector: 'app-admin-aerobicos', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminAerobicos {
  cfg: CrudCfg = {
    titulo: 'Aeróbicos', subtitulo: 'Clases, instructores, horarios y cupos', singular: 'clase',
    ruta: '/admin/aerobicos', puedeEliminar: false,
    campos: [
      { key: 'nombre', label: 'Nombre de la clase', tipo: 'text', requerido: true, max: 120 },
      { key: 'descripcion', label: 'Descripción', tipo: 'textarea' },
      { key: 'instructorId', label: 'Instructor', tipo: 'select', requerido: true,
        opcionesRemotas: { ruta: '/admin/personal', valor: (p: any) => String(p.id), etiqueta: (p: any) => `${p.nombres} ${p.apellidos} (${p.cargo})` } },
      { key: 'fecha', label: 'Fecha', tipo: 'date', requerido: true },
      { key: 'horaInicio', label: 'Hora de inicio', tipo: 'time', requerido: true },
      { key: 'horaFin', label: 'Hora de fin', tipo: 'time', requerido: true },
      { key: 'cupoMaximo', label: 'Cupo máximo', tipo: 'number', requerido: true, min: 1 },
    ],
    columnas: [
      { key: 'nombre', label: 'Clase' }, { key: 'instructor', label: 'Instructor' }, { key: 'fecha', label: 'Fecha' },
      { key: 'horaInicio', label: 'Horario', fmt: (_, r) => `${hora(r.horaInicio)} - ${hora(r.horaFin)}` },
      { key: 'inscritos', label: 'Cupos', fmt: (_, r) => `${r.inscritos}/${r.cupoMaximo}` }, { key: 'estado', label: 'Estado' },
    ],
    acciones: [
      { etiqueta: 'Cancelar clase', visible: r => r.estado === 'PROGRAMADA', ruta: r => `/admin/aerobicos/${r.id}/estado`,
        cuerpo: () => ({ estado: 'CANCELADA' }), confirmar: '¿Cancelar esta clase?', exito: 'Clase cancelada.',
        clase: 'rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700' },
    ],
    aCuerpo: v => ids(v, 'instructorId'),
    deFila: r => ({ ...r, instructorId: String(r.instructorId), horaInicio: r.horaInicio?.slice(0, 5), horaFin: r.horaFin?.slice(0, 5) }),
  };
}

// ---------- MEMBRESÍAS ----------
@Component({ selector: 'app-admin-membresias', imports: [CrudPage], template: `<app-crud-page [cfg]="cfg" />` })
export class AdminMembresias {
  cfg: CrudCfg = {
    titulo: 'Membresías', subtitulo: 'Vigencias, renovaciones y vencimientos', singular: 'membresía',
    ruta: '/recepcion/clientes', puedeEliminar: true,
    campos: [],
    columnas: [
      { key: 'cliente', label: 'Cliente', fmt: f },
      { key: 'plan', label: 'Plan', fmt: f },
      { key: 'fechaInicio', label: 'Inicio', fmt: f }, { key: 'fechaFin', label: 'Vence', fmt: f },
      { key: 'estado', label: 'Estado' },
      { key: 'saldo', label: 'Saldo (Bs)', fmt: v => (v == null ? '—' : String(v)) },
    ],
    acciones: [
      { etiqueta: 'Renovar', metodo: 'post', visible: r => r.estado !== 'CANCELADA', ruta: r => `/recepcion/membresias/${r.id}/renovar`, confirmar: '¿Renovar esta membresía?', exito: 'Membresía renovada.' },
      { etiqueta: 'Cancelar', visible: r => r.estado !== 'CANCELADA', ruta: r => `/recepcion/membresias/${r.id}/cancelar`, confirmar: '¿Cancelar esta membresía?', exito: 'Membresía cancelada.', clase: 'rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700' },
    ],
  };
}