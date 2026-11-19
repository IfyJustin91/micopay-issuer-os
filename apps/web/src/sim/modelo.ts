/* Simulador de la maqueta — modelo.

   Es el modelo de la MAQUETA, no el del producto (PROJECT.md §18 sigue
   abierto). Vive solo en el navegador: no toca Stellar, ningún banco ni
   Etherfuse. Una sola persona hace todo; no hay roles ni aprobaciones.

   Los montos son enteros en CENTAVOS para no arrastrar errores de punto
   flotante. 1 MXEJ = 1 MXN en el ejemplo. */

export type Centavos = number;

export type TipoOperacion = 'Emisión' | 'Redención con SPEI' | 'Pago de café';

export type EstadoOperacion =
  | 'Completa'
  | 'Incompleta' // quemada y pago SPEI iniciado, falta el CEP
  | 'Pendiente de fondos'; // solicitada, sin saldo bancario para pagarla

export interface Paso {
  descripcion: string;
  estado: 'confirmado' | 'pendiente';
  fecha: string | null;
  evidencia: string;
}

export interface Operacion {
  id: string;
  tipo: TipoOperacion;
  estado: EstadoOperacion;
  monto: Centavos;
  deudor: string;
  acreedor: string;
  fechas: { creacion: string; autorizacion: string | null; liquidacion: string | null; abono: string | null };
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

export interface Partida {
  fecha: string;
  concepto: string;
  /** Con signo: positivo entra, negativo sale. */
  monto: Centavos;
  operacion: string | null;
  evidencia: string;
}

export interface Conversion {
  id: string;
  monto: Centavos;
  estado: 'pendiente' | 'confirmada';
  solicitada: string;
  confirmada: string | null;
}

export interface Discrepancia {
  id: string;
  /** Tipos de PROJECT.md §6. */
  tipo: 'Quema sin pago de redención' | 'Movimiento bancario no identificado' | 'Diferencia de redondeo';
  gravedadSimulada: 'Alta' | 'Media' | 'Baja';
  estado: 'abierta' | 'resuelta';
  operacion: string | null;
  monto: Centavos;
  descripcion: string;
  bloqueo: string;
}

export interface Evento {
  fecha: string;
  texto: string;
}

export interface Estado {
  version: 1;
  /** Fecha de corte de la valuación simulada de los CETES. */
  corte: string;
  /** Tokens en circulación, incluidos los apartados para quemar. */
  circulacion: Centavos;
  /** Tokens apartados de redenciones pendientes de fondos (subconjunto de circulacion). */
  pendientesDeQuema: Centavos;
  /** Valuación simulada en MXN de los CETES tokenizados. */
  cetes: Centavos;
  banco: Centavos;
  partidasBanco: Partida[];
  conversiones: Conversion[];
  operaciones: Operacion[];
  discrepancias: Discrepancia[];
  /** Bitácora de solo agregar (PROJECT.md §10). */
  bitacora: Evento[];
  siguiente: { operacion: number; conversion: number; discrepancia: number };
}

export const pesos = (c: Centavos) => c / 100;
export const centavos = (mxn: number) => Math.round(mxn * 100);
