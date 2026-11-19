/* Escenario de ejemplo (ficticio) — discrepancias YA clasificadas y reglas de
   bloqueo, para el panel de discrepancias (IOS-3). El panel las muestra y las
   filtra; no asigna gravedad ni calcula bloqueos.

   Los tipos salen de PROJECT.md §6. La gravedad es simulada. Las reglas son
   políticas FICTICIAS del ejemplo, no del producto: la política real está
   abierta (PROJECT.md §18). Cada discrepancia identifica emisor, red,
   contrato, activo y operación (PROJECT.md §15). */

export interface DiscrepanciaEjemplo {
  id: string;
  tipo: string;
  gravedadSimulada: 'Alta' | 'Media' | 'Baja';
  emisor: string;
  red: string;
  contrato: string;
  activo: string;
  /** Operación del ejemplo (ver operaciones.ts), o null si no hay ninguna ligada. */
  operacion: string | null;
  monto: string;
  descripcion: string;
  bloqueo: string;
}

export interface ReglaEjemplo {
  id: number;
  regla: string;
  efecto: string;
  base: string;
  estadoEnElEjemplo: string;
}

const BASE = {
  emisor: 'Emisora Ejemplo',
  red: 'Stellar testnet (ficticia)',
  contrato: 'C-EJEMPLO-CONTRATO-NO-EXISTE',
  activo: 'MXEJ',
} as const;

export const discrepancias: DiscrepanciaEjemplo[] = [
  {
    id: 'D-01',
    tipo: 'Quema sin pago de redención',
    gravedadSimulada: 'Alta',
    ...BASE,
    operacion: 'OP-0002',
    monto: '30000.00',
    descripcion: 'Los tokens se quemaron y el pago SPEI ya se inició, pero falta la evidencia (CEP).',
    bloqueo: 'La redención queda incompleta. No bloquea otras operaciones en el ejemplo.',
  },
  {
    id: 'D-02',
    tipo: 'Movimiento bancario no identificado',
    gravedadSimulada: 'Media',
    ...BASE,
    operacion: null,
    monto: '25000.00',
    descripcion: 'Un depósito en la cuenta de Banco Ejemplo sin operación que lo explique.',
    bloqueo: 'No se cuenta en el saldo bancario disponible ni en el respaldo hasta identificarlo.',
  },
  {
    id: 'D-03',
    tipo: 'Diferencia de redondeo',
    gravedadSimulada: 'Baja',
    ...BASE,
    operacion: 'OP-0003',
    monto: '0.01',
    descripcion: 'MXN 0.01 de diferencia entre el importe pactado y el transferido.',
    bloqueo: 'Ninguno.',
  },
];

export const reglas: ReglaEjemplo[] = [
  {
    id: 1,
    regla: 'Sin evidencia de reserva y sin asiento balanceado',
    efecto: 'No se emite',
    base: 'README.md (principio 4) y PROJECT.md §15',
    estadoEnElEjemplo: 'No activa',
  },
  {
    id: 2,
    regla: 'Respaldo total menor a 100 %',
    efecto: 'Bloquea nuevas emisiones',
    base: 'Política ficticia del ejemplo',
    estadoEnElEjemplo: 'No activa: el respaldo es de 110 %',
  },
  {
    id: 3,
    regla: 'Saldo bancario insuficiente para las redenciones del día',
    efecto: 'La solicitud se registra y su pago queda "pendiente de fondos", con alerta',
    base: 'Política ficticia del ejemplo; la real no está documentada (PROJECT.md §18)',
    estadoEnElEjemplo: 'No activa',
  },
  {
    id: 4,
    regla: 'Quema sin pago SPEI confirmado',
    efecto: 'Discrepancia; la redención queda incompleta',
    base: 'PROJECT.md §6 y §15',
    estadoEnElEjemplo: 'Activa: D-01',
  },
];
