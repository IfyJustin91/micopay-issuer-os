/* Simulador de la maqueta — acciones.

   Funciones puras: reciben el estado y devuelven el estado nuevo o un error.
   Aplican solo las reglas de ejemplo (supuestos, no políticas del producto):
     1. Sin evidencia del depósito no se emite (README principio 4; PROJECT.md §15).
     2. Con respaldo total menor a 100 % se bloquean nuevas emisiones.
     3. Si el saldo bancario no alcanza, la redención queda "pendiente de fondos".
     4. Una redención no está completa hasta tener quema y pago confirmados
        (README principio 5; PROJECT.md §15); mientras, hay una discrepancia. */

import { ACTIVO } from './escenario';
import { cobertura, disponibleParaConvertir, redimible } from './selectores';
import type { Centavos, Discrepancia, Estado, Operacion } from './modelo';

export type Resultado = { ok: true; estado: Estado } | { ok: false; error: string };

const folio = (n: number) => `OP-${String(n).padStart(4, '0')}`;
const ok = (estado: Estado): Resultado => ({ ok: true, estado });
const error = (e: string): Resultado => ({ ok: false, error: e });

function anotar(e: Estado, ahora: string, texto: string): Estado {
  return { ...e, bitacora: [...e.bitacora, { fecha: ahora, texto }] };
}

function cambiarOperacion(e: Estado, id: string, f: (o: Operacion) => Operacion): Estado {
  return { ...e, operaciones: e.operaciones.map((o) => (o.id === id ? f(o) : o)) };
}

function quemaSinPago(e: Estado, op: string, monto: Centavos): { estado: Estado; d: Discrepancia } {
  const d: Discrepancia = {
    id: `D-${String(e.siguiente.discrepancia).padStart(2, '0')}`,
    tipo: 'Quema sin pago de redención',
    gravedadSimulada: 'Alta',
    estado: 'abierta',
    operacion: op,
    monto,
    descripcion: 'Los tokens se quemaron y el pago SPEI ya se inició, pero falta la evidencia (CEP).',
    bloqueo: 'La redención queda incompleta. No bloquea otras operaciones en el ejemplo.',
  };
  return { estado: { ...e, discrepancias: [...e.discrepancias, d], siguiente: { ...e.siguiente, discrepancia: e.siguiente.discrepancia + 1 } }, d };
}

/** Quema los tokens e inicia el pago SPEI de una redención ya registrada. */
function quemarYPagar(e: Estado, op: Operacion, ahora: string): Estado {
  let s: Estado = {
    ...e,
    circulacion: e.circulacion - op.monto,
    banco: e.banco - op.monto,
    partidasBanco: [...e.partidasBanco, { fecha: ahora, concepto: 'Pago SPEI de redención iniciado', monto: -op.monto, operacion: op.id, evidencia: 'Orden de pago ficticia; CEP pendiente' }],
  };
  s = cambiarOperacion(s, op.id, (o) => ({
    ...o,
    estado: 'Incompleta',
    fechas: { ...o.fechas, autorizacion: ahora },
    pasos: [
      o.pasos[0]!,
      { descripcion: 'Quema en Stellar', estado: 'confirmado', fecha: ahora, evidencia: `hash-ficticio-${o.id.toLowerCase()}` },
      { descripcion: 'Pago SPEI iniciado', estado: 'confirmado', fecha: ahora, evidencia: 'Orden de pago ficticia' },
      { descripcion: 'Pago SPEI confirmado con CEP', estado: 'pendiente', fecha: null, evidencia: 'Falta el CEP' },
    ],
    referencias: { ...o.referencias, hashStellar: `hash-ficticio-${o.id.toLowerCase()}`, claveRastreoSpei: `EJEMPLO-RASTREO-${o.id.slice(3)}`, cep: 'Pendiente' },
    faltante: 'Falta el CEP del pago SPEI. Una redención no se marca como completa antes de confirmar la quema y el pago (PROJECT.md §15).',
  }));
  const { estado, d } = quemaSinPago(s, op.id, op.monto);
  return anotar(estado, ahora, `${op.id}: tokens quemados y pago SPEI iniciado; ${d.id} abierta hasta confirmar el CEP.`);
}

export function emitir(e: Estado, p: { monto: Centavos; cliente: string; claveRastreo: string; ahora: string }): Resultado {
  if (!(p.monto > 0)) return error('El monto debe ser mayor a cero.');
  if (!p.claveRastreo.trim()) return error('Regla 1: no se emite sin evidencia del depósito (clave de rastreo SPEI).');
  if (cobertura(e) < 1) return error('Regla 2: el respaldo total es menor a 100 %; las emisiones están bloqueadas.');
  const id = folio(e.siguiente.operacion);
  const op: Operacion = {
    id,
    tipo: 'Emisión',
    estado: 'Completa',
    monto: p.monto,
    deudor: p.cliente.trim() || 'Cliente Ejemplo',
    acreedor: 'Emisora Ejemplo',
    fechas: { creacion: p.ahora, autorizacion: p.ahora, liquidacion: p.ahora, abono: p.ahora },
    pasos: [
      { descripcion: 'Reserva recibida por SPEI', estado: 'confirmado', fecha: p.ahora, evidencia: `Clave de rastreo ${p.claveRastreo.trim()}` },
      { descripcion: 'Asiento balanceado: reserva y pasivo', estado: 'confirmado', fecha: p.ahora, evidencia: `Asiento ficticio de ${id}` },
      { descripcion: 'Emisión en Stellar', estado: 'confirmado', fecha: p.ahora, evidencia: `hash-ficticio-${id.toLowerCase()}` },
    ],
    referencias: {
      hashStellar: `hash-ficticio-${id.toLowerCase()}`,
      activoYContrato: ACTIVO,
      etherfuse: 'No aplica',
      claveRastreoSpei: p.claveRastreo.trim(),
      referenciaNumerica: 'No disponible',
      clabeBeneficiaria: 'CLABE ficticia de Emisora Ejemplo',
      cep: 'CEP ficticio (simulado)',
      endToEndId: 'No disponible',
    },
    faltante: null,
  };
  return ok(anotar({
    ...e,
    circulacion: e.circulacion + p.monto,
    banco: e.banco + p.monto,
    partidasBanco: [...e.partidasBanco, { fecha: p.ahora, concepto: 'Reserva recibida por SPEI', monto: p.monto, operacion: id, evidencia: `Clave de rastreo ${p.claveRastreo.trim()}` }],
    operaciones: [...e.operaciones, op],
    siguiente: { ...e.siguiente, operacion: e.siguiente.operacion + 1 },
  }, p.ahora, `${id}: emisión completa.`));
}

export function solicitarRedencion(e: Estado, p: { monto: Centavos; tenedor: string; ahora: string }): Resultado {
  if (!(p.monto > 0)) return error('El monto debe ser mayor a cero.');
  if (p.monto > redimible(e)) return error('El monto es mayor que los tokens en circulación disponibles para redimir.');
  const id = folio(e.siguiente.operacion);
  const op: Operacion = {
    id,
    tipo: 'Redención con SPEI',
    estado: 'Pendiente de fondos',
    monto: p.monto,
    deudor: 'Emisora Ejemplo',
    acreedor: p.tenedor.trim() || 'Tenedor Ejemplo',
    fechas: { creacion: p.ahora, autorizacion: null, liquidacion: null, abono: null },
    pasos: [
      { descripcion: 'Solicitud de redención', estado: 'confirmado', fecha: p.ahora, evidencia: `Solicitud ficticia de ${id}` },
      { descripcion: 'Pago SPEI', estado: 'pendiente', fecha: null, evidencia: 'Pendiente de fondos' },
    ],
    referencias: {
      hashStellar: 'Pendiente',
      activoYContrato: ACTIVO,
      etherfuse: 'No aplica',
      claveRastreoSpei: 'Pendiente',
      referenciaNumerica: 'No disponible',
      clabeBeneficiaria: `CLABE ficticia de ${p.tenedor.trim() || 'Tenedor Ejemplo'}`,
      cep: 'Pendiente',
      endToEndId: 'No disponible',
    },
    faltante: 'Regla 3: el saldo bancario no alcanza para pagarla. Los tokens quedan apartados hasta que haya fondos.',
  };
  const base: Estado = { ...e, operaciones: [...e.operaciones, op], siguiente: { ...e.siguiente, operacion: e.siguiente.operacion + 1 } };
  if (e.banco >= p.monto) return ok(quemarYPagar(base, op, p.ahora));
  return ok(anotar({ ...base, pendientesDeQuema: e.pendientesDeQuema + p.monto }, p.ahora, `${id}: redención registrada y pendiente de fondos (regla 3).`));
}

export function pagarRedencion(e: Estado, p: { id: string; ahora: string }): Resultado {
  const op = e.operaciones.find((o) => o.id === p.id);
  if (!op || op.estado !== 'Pendiente de fondos') return error('Esa redención no está pendiente de fondos.');
  if (e.banco < op.monto) return error('Regla 3: el saldo bancario sigue sin alcanzar.');
  return ok(quemarYPagar({ ...e, pendientesDeQuema: e.pendientesDeQuema - op.monto }, op, p.ahora));
}

export function confirmarCep(e: Estado, p: { id: string; ahora: string }): Resultado {
  const op = e.operaciones.find((o) => o.id === p.id);
  if (!op || op.estado !== 'Incompleta') return error('Esa operación no espera un CEP.');
  let s = cambiarOperacion(e, p.id, (o) => ({
    ...o,
    estado: 'Completa',
    fechas: { ...o.fechas, liquidacion: p.ahora, abono: p.ahora },
    pasos: o.pasos.map((x) => (x.estado === 'pendiente' ? { ...x, estado: 'confirmado', fecha: p.ahora, evidencia: 'CEP ficticio (simulado)' } : x)),
    referencias: { ...o.referencias, cep: 'CEP ficticio (simulado)' },
    faltante: null,
  }));
  s = { ...s, discrepancias: s.discrepancias.map((d) => (d.operacion === p.id && d.tipo === 'Quema sin pago de redención' ? { ...d, estado: 'resuelta' } : d)) };
  return ok(anotar(s, p.ahora, `${p.id}: CEP recibido; redención completa.`));
}

export function solicitarConversion(e: Estado, p: { monto: Centavos; ahora: string }): Resultado {
  if (!(p.monto > 0)) return error('El monto debe ser mayor a cero.');
  if (p.monto > disponibleParaConvertir(e)) return error('El monto es mayor que los CETES disponibles para convertir.');
  const id = `CV-${String(e.siguiente.conversion).padStart(2, '0')}`;
  return ok(anotar({
    ...e,
    conversiones: [...e.conversiones, { id, monto: p.monto, estado: 'pendiente', solicitada: p.ahora, confirmada: null }],
    siguiente: { ...e.siguiente, conversion: e.siguiente.conversion + 1 },
  }, p.ahora, `${id}: conversión de CETES a banco solicitada; no se suma hasta confirmar el abono.`));
}

export function confirmarConversion(e: Estado, p: { id: string; ahora: string }): Resultado {
  const c = e.conversiones.find((x) => x.id === p.id);
  if (!c || c.estado !== 'pendiente') return error('Esa conversión no está pendiente.');
  return ok(anotar({
    ...e,
    cetes: e.cetes - c.monto,
    banco: e.banco + c.monto,
    partidasBanco: [...e.partidasBanco, { fecha: p.ahora, concepto: 'Abono de conversión de CETES', monto: c.monto, operacion: null, evidencia: `Abono ficticio de ${c.id}` }],
    conversiones: e.conversiones.map((x) => (x.id === p.id ? { ...x, estado: 'confirmada', confirmada: p.ahora } : x)),
  }, p.ahora, `${c.id}: abono confirmado; pasa de CETES a banco.`));
}

export function agregarLiquidez(e: Estado, p: { monto: Centavos; ahora: string }): Resultado {
  if (!(p.monto > 0)) return error('El monto debe ser mayor a cero.');
  return ok(anotar({
    ...e,
    banco: e.banco + p.monto,
    partidasBanco: [...e.partidasBanco, { fecha: p.ahora, concepto: 'Aportación de liquidez del emisor', monto: p.monto, operacion: null, evidencia: 'Depósito ficticio del emisor' }],
  }, p.ahora, 'Liquidez agregada al banco por el emisor.'));
}

export function resolverDiscrepancia(e: Estado, p: { id: string; ahora: string }): Resultado {
  const d = e.discrepancias.find((x) => x.id === p.id);
  if (!d || d.estado !== 'abierta') return error('Esa discrepancia no está abierta.');
  if (d.tipo === 'Quema sin pago de redención') return error('Se resuelve al confirmar el CEP de su redención.');
  let s: Estado = { ...e, discrepancias: e.discrepancias.map((x) => (x.id === p.id ? { ...x, estado: 'resuelta' } : x)) };
  if (d.tipo === 'Movimiento bancario no identificado') {
    s = {
      ...s,
      banco: s.banco + d.monto,
      partidasBanco: [...s.partidasBanco, { fecha: p.ahora, concepto: 'Depósito identificado como aportación del emisor', monto: d.monto, operacion: null, evidencia: `Identificación ficticia de ${d.id}` }],
    };
    return ok(anotar(s, p.ahora, `${d.id}: depósito identificado como aportación del emisor; se suma al banco.`));
  }
  return ok(anotar(s, p.ahora, `${d.id}: diferencia de redondeo registrada como ajuste.`));
}
