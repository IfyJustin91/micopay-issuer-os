/* Escenario inicial (ficticio) del simulador. "Reiniciar escenario" vuelve aquí.

   "Emisora Ejemplo" es un emisor TERCERO inventado, no MicoPay. Su respaldo
   principal son CETES tokenizados de Etherfuse y tiene saldo en banco para
   pagar por SPEI.

   Cuadre:
     pasivo                  1,000,000.00 MXEJ en circulación
     CETES (valuación sim.)  1,000,000.00 MXN
     banco                     100,000.00 MXN = 80,000 + 50,000 (OP-0001) − 30,000 (OP-0002)
     respaldo total          1,100,000.00 = 110 %;  banco / pasivo = 10 %
   La conversión de CETES a banco de 50,000.00 está pendiente y no se suma
   hasta confirmar el abono. El depósito no identificado de 25,000.00 (D-02)
   tampoco se suma hasta identificarlo.

   Hashes, claves de rastreo, CEP y cuentas son textos ficticios. */

import { emisor } from '../ejemplos/emisor';
import type { Estado } from './modelo';

export const ACTIVO = `${emisor.activo.codigo} · ${emisor.activo.contrato} · ${emisor.activo.red}`;

export function escenarioInicial(): Estado {
  return {
    version: 1,
    corte: '2026-11-18',
    circulacion: 100_000_000,
    pendientesDeQuema: 0,
    cetes: 100_000_000,
    banco: 10_000_000,
    partidasBanco: [
      { fecha: '2026-11-17T00:00:00Z', concepto: 'Saldo inicial', monto: 8_000_000, operacion: null, evidencia: 'Estado de cuenta ficticio al 2026-11-17' },
      { fecha: '2026-11-17T15:00:00Z', concepto: 'Reserva recibida por SPEI', monto: 5_000_000, operacion: 'OP-0001', evidencia: 'CEP ficticio de OP-0001' },
      { fecha: '2026-11-18T10:08:00Z', concepto: 'Pago SPEI de redención iniciado', monto: -3_000_000, operacion: 'OP-0002', evidencia: 'Orden de pago ficticia; CEP pendiente' },
    ],
    conversiones: [
      { id: 'CV-01', monto: 5_000_000, estado: 'pendiente', solicitada: '2026-11-18T09:00:00Z', confirmada: null },
    ],
    operaciones: [
      {
        id: 'OP-0001',
        tipo: 'Emisión',
        estado: 'Completa',
        monto: 5_000_000,
        deudor: 'Cliente Ejemplo S.A.',
        acreedor: 'Emisora Ejemplo',
        fechas: { creacion: '2026-11-17T15:00:00Z', autorizacion: '2026-11-17T15:10:00Z', liquidacion: '2026-11-17T15:12:00Z', abono: '2026-11-17T15:13:00Z' },
        pasos: [
          { descripcion: 'Reserva recibida por SPEI', estado: 'confirmado', fecha: '2026-11-17T15:00:00Z', evidencia: 'CEP ficticio' },
          { descripcion: 'Asiento balanceado: reserva y pasivo', estado: 'confirmado', fecha: '2026-11-17T15:10:00Z', evidencia: 'Asiento ficticio AS-0001' },
          { descripcion: 'Emisión en Stellar', estado: 'confirmado', fecha: '2026-11-17T15:12:00Z', evidencia: 'hash-ficticio-op-0001' },
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
        monto: 3_000_000,
        deudor: 'Emisora Ejemplo',
        acreedor: 'Tenedor Ejemplo',
        fechas: { creacion: '2026-11-18T10:00:00Z', autorizacion: '2026-11-18T10:05:00Z', liquidacion: null, abono: null },
        pasos: [
          { descripcion: 'Solicitud de redención', estado: 'confirmado', fecha: '2026-11-18T10:00:00Z', evidencia: 'Solicitud ficticia SR-0002' },
          { descripcion: 'Quema en Stellar', estado: 'confirmado', fecha: '2026-11-18T10:06:00Z', evidencia: 'hash-ficticio-op-0002' },
          { descripcion: 'Pago SPEI iniciado', estado: 'confirmado', fecha: '2026-11-18T10:08:00Z', evidencia: 'Orden de pago ficticia' },
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
        monto: 425_000,
        deudor: 'Compradora Ejemplo',
        acreedor: 'Productor Ejemplo',
        fechas: { creacion: '2026-11-18T12:30:00Z', autorizacion: '2026-11-18T12:30:00Z', liquidacion: '2026-11-18T12:30:05Z', abono: '2026-11-18T12:30:05Z' },
        pasos: [
          { descripcion: 'Transferencia de la compradora al productor, sin crédito', estado: 'confirmado', fecha: '2026-11-18T12:30:05Z', evidencia: 'hash-ficticio-op-0003' },
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
    ],
    discrepancias: [
      {
        id: 'D-01',
        tipo: 'Quema sin pago de redención',
        gravedadSimulada: 'Alta',
        estado: 'abierta',
        operacion: 'OP-0002',
        monto: 3_000_000,
        descripcion: 'Los tokens se quemaron y el pago SPEI ya se inició, pero falta la evidencia (CEP).',
        bloqueo: 'La redención queda incompleta. No bloquea otras operaciones en el ejemplo.',
      },
      {
        id: 'D-02',
        tipo: 'Movimiento bancario no identificado',
        gravedadSimulada: 'Media',
        estado: 'abierta',
        operacion: null,
        monto: 2_500_000,
        descripcion: 'Un depósito en la cuenta de Banco Ejemplo sin operación que lo explique.',
        bloqueo: 'No se cuenta en el saldo bancario ni en el respaldo hasta identificarlo.',
      },
      {
        id: 'D-03',
        tipo: 'Diferencia de redondeo',
        gravedadSimulada: 'Baja',
        estado: 'abierta',
        operacion: 'OP-0003',
        monto: 1,
        descripcion: 'MXN 0.01 de diferencia entre el importe pactado y el transferido.',
        bloqueo: 'Ninguno.',
      },
    ],
    bitacora: [
      { fecha: '2026-11-18T00:00:00Z', texto: 'Escenario de ejemplo cargado.' },
    ],
    siguiente: { operacion: 4, conversion: 2, discrepancia: 4 },
  };
}
