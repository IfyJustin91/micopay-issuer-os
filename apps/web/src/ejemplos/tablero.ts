/* Escenario de ejemplo (ficticio) — datos del tablero de activos, pasivos y
   cobertura (PROJECT.md §8). Los consume IOS-1.

   Las cifras vienen YA calculadas: el tablero las muestra tal cual, no define
   ni calcula indicadores. Todo es un supuesto de ejemplo, no una política del
   producto.

   Cuadre del ejemplo:
     pasivo nominal          1,000,000.00 MXEJ en circulación
     CETES tokenizados       1,000,000.00 MXN (valuación simulada)
     saldo bancario            100,000.00 MXN
     respaldo total          1,100,000.00 MXN = 110 % del pasivo
     saldo bancario / pasivo                  =  10 %
   La conversión de CETES a banco solicitada (50,000.00) NO se suma: está
   pendiente hasta que el abono aparezca confirmado, para no contar el mismo
   importe como CETES y como efectivo a la vez. */

export interface Partida {
  concepto: string;
  /** Con signo: "+50000.00" entra, "-30000.00" sale. */
  monto: string;
  /** Operación del ejemplo que la origina, si la hay (ver operaciones.ts). */
  operacion: string | null;
  evidencia: string;
}

export interface Posicion {
  id: string;
  tipo: string;
  /** La entidad ficticia que mantiene la posición. */
  entidad: string;
  monto: string;
  /** ¿Se puede usar para pagar por SPEI en el ejemplo? */
  disponibleParaSpei: boolean;
  /** ¿Se suma al respaldo total? */
  cuentaEnRespaldo: boolean;
  liquidacion: string;
  valuacion: { fuente: string; corte: string } | null;
  nota: string | null;
  /** Partidas que explican el saldo, para seguirlo hasta su evidencia (PROJECT.md §15). */
  partidas: Partida[];
}

export interface SolicitudPendiente {
  operacion: string;
  tipo: string;
  monto: string;
  estado: string;
}

export interface TableroEjemplo {
  corte: string;
  pasivo: {
    enCirculacion: string;
    enTesoreria: string;
    bloqueados: string;
    pendientesDeQuema: string;
  };
  posiciones: Posicion[];
  indicadores: {
    respaldoTotal: string;
    coberturaTotal: string;
    saldoBancarioDisponible: string;
    coberturaLiquida: string;
  };
  solicitudesPendientes: SolicitudPendiente[];
  ultimaAtestacion: { fecha: string; evidencia: string } | null;
  supuestos: string[];
}

export const tablero: TableroEjemplo = {
  corte: '2026-11-18',
  pasivo: {
    enCirculacion: '1000000.00',
    enTesoreria: '0.00',
    bloqueados: '0.00',
    pendientesDeQuema: '0.00',
  },
  posiciones: [
    {
      id: 'cetes',
      tipo: 'CETES tokenizados de Etherfuse',
      entidad: 'Emisora Ejemplo, cuenta en Stellar',
      monto: '1000000.00',
      disponibleParaSpei: false,
      cuentaEnRespaldo: true,
      liquidacion: 'Plazo ficticio del ejemplo; no es el plazo real de Etherfuse',
      valuacion: { fuente: 'Valuación simulada', corte: '2026-11-18' },
      nota: 'Reserva principal del escenario.',
      partidas: [
        { concepto: 'Posición al corte', monto: '+1000000.00', operacion: null, evidencia: 'Saldo en cadena ficticio al 2026-11-18' },
      ],
    },
    {
      id: 'banco',
      tipo: 'Saldo bancario',
      entidad: 'Emisora Ejemplo, cuenta en Banco Ejemplo',
      monto: '100000.00',
      disponibleParaSpei: true,
      cuentaEnRespaldo: true,
      liquidacion: 'Disponible en el ejemplo',
      valuacion: null,
      nota: null,
      partidas: [
        { concepto: 'Saldo inicial', monto: '+80000.00', operacion: null, evidencia: 'Estado de cuenta ficticio al 2026-11-17' },
        { concepto: 'Reserva recibida por SPEI', monto: '+50000.00', operacion: 'OP-0001', evidencia: 'CEP ficticio de la operación OP-0001' },
        { concepto: 'Pago SPEI de redención iniciado', monto: '-30000.00', operacion: 'OP-0002', evidencia: 'Orden de pago ficticia; CEP pendiente' },
      ],
    },
    {
      id: 'conversion',
      tipo: 'Conversión de CETES a banco solicitada',
      entidad: 'Emisora Ejemplo',
      monto: '50000.00',
      disponibleParaSpei: false,
      cuentaEnRespaldo: false,
      liquidacion: 'Pendiente hasta que el abono bancario aparezca confirmado',
      valuacion: null,
      nota: 'No se suma al respaldo: los CETES siguen contados en su posición hasta que se confirme el abono.',
      partidas: [],
    },
  ],
  indicadores: {
    respaldoTotal: '1100000.00',
    coberturaTotal: '110%',
    saldoBancarioDisponible: '100000.00',
    coberturaLiquida: '10%',
  },
  solicitudesPendientes: [
    { operacion: 'OP-0002', tipo: 'Redención con SPEI', monto: '30000.00', estado: 'Tokens quemados; pago SPEI iniciado, falta el CEP' },
  ],
  ultimaAtestacion: null,
  supuestos: [
    'Todas las cifras son ilustrativas.',
    'El respaldo y la cobertura se calculan sobre el pasivo nominal de MXN 1,000,000.',
    'El ejemplo no tiene atestación.',
  ],
};
