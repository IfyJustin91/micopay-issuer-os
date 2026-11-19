/* Escenario de ejemplo (ficticio) — tres operaciones para el detalle de una
   operación (IOS-2). Cada una lleva las referencias de PROJECT.md §9 que le
   aplican; las que no aplican lo dicen.

   - OP-0001 Emisión: completa. La reserva llega por SPEI, se registra el
     asiento balanceado y luego se emite (PROJECT.md §15).
   - OP-0002 Redención con SPEI: INCOMPLETA. Los tokens se quemaron y el pago
     SPEI se inició, pero falta el CEP. No se presenta como conciliada.
   - OP-0003 Pago de café: una transferencia del activo de la compradora al
     productor, sin crédito. No emite ni redime, y no tiene CEP ni referencias
     de Etherfuse.

   Hashes, claves de rastreo, referencias y CEP son textos ficticios: no
   existen en ninguna red ni banco. */

export interface Paso {
  descripcion: string;
  estado: 'confirmado' | 'pendiente';
  fecha: string | null;
  evidencia: string;
}

export interface OperacionEjemplo {
  id: string;
  tipo: 'Emisión' | 'Redención con SPEI' | 'Pago de café';
  estado: 'Completa' | 'Incompleta';
  monto: string;
  unidad: 'MXN' | 'MXEJ';
  deudor: string;
  acreedor: string;
  fechas: {
    creacion: string;
    autorizacion: string | null;
    liquidacion: string | null;
    abono: string | null;
  };
  pasos: Paso[];
  /** Referencias externas (PROJECT.md §9). "No aplica" o "Pendiente" cuando corresponde. */
  referencias: {
    hashStellar: string;
    activoYContrato: string;
    etherfuse: string;
    claveRastreoSpei: string;
    referenciaNumerica: string;
    clabeBeneficiaria: string;
    cep: string;
    endToEndId: string;
  };
  /** Qué falta y por qué no está conciliada. Null si está completa. */
  faltante: string | null;
}

const ACTIVO = 'MXEJ · C-EJEMPLO-CONTRATO-NO-EXISTE · Stellar testnet (ficticia)';

export const operaciones: OperacionEjemplo[] = [
  {
    id: 'OP-0001',
    tipo: 'Emisión',
    estado: 'Completa',
    monto: '50000.00',
    unidad: 'MXEJ',
    deudor: 'Cliente Ejemplo S.A.',
    acreedor: 'Emisora Ejemplo',
    fechas: {
      creacion: '2026-11-17T15:00:00Z',
      autorizacion: '2026-11-17T15:10:00Z',
      liquidacion: '2026-11-17T15:12:00Z',
      abono: '2026-11-17T15:13:00Z',
    },
    pasos: [
      { descripcion: 'Reserva recibida por SPEI: MXN 50,000.00', estado: 'confirmado', fecha: '2026-11-17T15:00:00Z', evidencia: 'CEP ficticio' },
      { descripcion: 'Asiento balanceado: reserva +50,000.00 / pasivo +50,000.00', estado: 'confirmado', fecha: '2026-11-17T15:10:00Z', evidencia: 'Asiento ficticio AS-0001' },
      { descripcion: 'Emisión de 50,000.00 MXEJ en Stellar', estado: 'confirmado', fecha: '2026-11-17T15:12:00Z', evidencia: 'hash-ficticio-op-0001' },
    ],
    referencias: {
      hashStellar: 'hash-ficticio-op-0001',
      activoYContrato: ACTIVO,
      etherfuse: 'No aplica',
      claveRastreoSpei: 'EJEMPLO-RASTREO-0001',
      referenciaNumerica: '1000001',
      clabeBeneficiaria: 'CLABE ficticia de Emisora Ejemplo',
      cep: 'CEP ficticio (ejemplo)',
      endToEndId: 'No disponible',
    },
    faltante: null,
  },
  {
    id: 'OP-0002',
    tipo: 'Redención con SPEI',
    estado: 'Incompleta',
    monto: '30000.00',
    unidad: 'MXEJ',
    deudor: 'Emisora Ejemplo',
    acreedor: 'Tenedor Ejemplo',
    fechas: {
      creacion: '2026-11-18T10:00:00Z',
      autorizacion: '2026-11-18T10:05:00Z',
      liquidacion: null,
      abono: null,
    },
    pasos: [
      { descripcion: 'Solicitud de redención de 30,000.00 MXEJ', estado: 'confirmado', fecha: '2026-11-18T10:00:00Z', evidencia: 'Solicitud ficticia SR-0002' },
      { descripcion: 'Quema de 30,000.00 MXEJ en Stellar', estado: 'confirmado', fecha: '2026-11-18T10:06:00Z', evidencia: 'hash-ficticio-op-0002' },
      { descripcion: 'Pago SPEI de MXN 30,000.00 iniciado', estado: 'confirmado', fecha: '2026-11-18T10:08:00Z', evidencia: 'Orden de pago ficticia' },
      { descripcion: 'Pago SPEI confirmado con CEP', estado: 'pendiente', fecha: null, evidencia: 'Falta el CEP' },
    ],
    referencias: {
      hashStellar: 'hash-ficticio-op-0002',
      activoYContrato: ACTIVO,
      etherfuse: 'No aplica',
      claveRastreoSpei: 'EJEMPLO-RASTREO-0002',
      referenciaNumerica: '1000002',
      clabeBeneficiaria: 'CLABE ficticia de Tenedor Ejemplo',
      cep: 'Pendiente',
      endToEndId: 'No disponible',
    },
    faltante: 'Falta el CEP del pago SPEI. Una redención no se marca como completa antes de confirmar la quema y el pago (PROJECT.md §15).',
  },
  {
    id: 'OP-0003',
    tipo: 'Pago de café',
    estado: 'Completa',
    monto: '4250.00',
    unidad: 'MXEJ',
    deudor: 'Compradora Ejemplo',
    acreedor: 'Productor Ejemplo',
    fechas: {
      creacion: '2026-11-18T12:30:00Z',
      autorizacion: '2026-11-18T12:30:00Z',
      liquidacion: '2026-11-18T12:30:05Z',
      abono: '2026-11-18T12:30:05Z',
    },
    pasos: [
      { descripcion: 'Transferencia de 4,250.00 MXEJ de la compradora al productor, sin crédito', estado: 'confirmado', fecha: '2026-11-18T12:30:05Z', evidencia: 'hash-ficticio-op-0003' },
    ],
    referencias: {
      hashStellar: 'hash-ficticio-op-0003',
      activoYContrato: ACTIVO,
      etherfuse: 'No aplica',
      claveRastreoSpei: 'No aplica',
      referenciaNumerica: 'No aplica',
      clabeBeneficiaria: 'No aplica',
      cep: 'No aplica',
      endToEndId: 'No disponible',
    },
    faltante: null,
  },
];
