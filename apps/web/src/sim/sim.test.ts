import { describe, expect, it } from 'vitest';
import {
  agregarLiquidez, confirmarCep, confirmarConversion, emitir, pagarRedencion,
  resolverDiscrepancia, solicitarConversion, solicitarRedencion, type Resultado,
} from './acciones';
import { escenarioInicial } from './escenario';
import type { Estado } from './modelo';
import { cobertura, coberturaLiquida, reglas, respaldoTotal, sumaPartidasBanco } from './selectores';

const AHORA = '2026-11-18T18:00:00Z';

function ok(r: Resultado): Estado {
  if (!r.ok) throw new Error(r.error);
  return r.estado;
}

const activa = (e: Estado, id: number) => reglas(e).find((r) => r.id === id)!.activa;

describe('escenario inicial', () => {
  it('cuadra: 110 % de respaldo, 10 % en banco y partidas = saldo', () => {
    const e = escenarioInicial();
    expect(cobertura(e)).toBeCloseTo(1.1);
    expect(coberturaLiquida(e)).toBeCloseTo(0.1);
    expect(sumaPartidasBanco(e)).toBe(e.banco);
    expect(activa(e, 4)).toBe(true);
    expect(activa(e, 2)).toBe(false);
  });
});

describe('emisión', () => {
  it('regla 1: sin clave de rastreo no se emite', () => {
    const r = emitir(escenarioInicial(), { monto: 1000_00, cliente: 'X', claveRastreo: '  ', ahora: AHORA });
    expect(r.ok).toBe(false);
  });

  it('suma al banco y al pasivo por igual, sin mutar el estado anterior', () => {
    const e0 = escenarioInicial();
    const e = ok(emitir(e0, { monto: 200_000_00, cliente: 'X', claveRastreo: 'R-1', ahora: AHORA }));
    expect(e.circulacion).toBe(e0.circulacion + 200_000_00);
    expect(e.banco).toBe(e0.banco + 200_000_00);
    expect(sumaPartidasBanco(e)).toBe(e.banco);
    expect(e.operaciones.at(-1)).toMatchObject({ id: 'OP-0004', tipo: 'Emisión', estado: 'Completa' });
    expect(e0.operaciones).toHaveLength(3);
  });

  it('regla 2: con respaldo menor a 100 % se bloquea', () => {
    const e = { ...escenarioInicial(), cetes: 0 };
    expect(activa(e, 2)).toBe(true);
    const r = emitir(e, { monto: 1_00, cliente: 'X', claveRastreo: 'R-1', ahora: AHORA });
    expect(r.ok).toBe(false);
  });
});

describe('redención', () => {
  it('con fondos: quema, paga y queda incompleta hasta el CEP', () => {
    const e0 = escenarioInicial();
    const e1 = ok(solicitarRedencion(e0, { monto: 10_000_00, tenedor: 'T', ahora: AHORA }));
    const op = e1.operaciones.at(-1)!;
    expect(op.estado).toBe('Incompleta');
    expect(e1.circulacion).toBe(e0.circulacion - 10_000_00);
    expect(e1.banco).toBe(e0.banco - 10_000_00);
    expect(e1.discrepancias.filter((d) => d.operacion === op.id && d.estado === 'abierta')).toHaveLength(1);

    const e2 = ok(confirmarCep(e1, { id: op.id, ahora: AHORA }));
    expect(e2.operaciones.at(-1)!.estado).toBe('Completa');
    expect(e2.discrepancias.filter((d) => d.operacion === op.id && d.estado === 'abierta')).toHaveLength(0);
    expect(sumaPartidasBanco(e2)).toBe(e2.banco);
  });

  it('regla 3: sin fondos queda pendiente; al agregar liquidez se paga', () => {
    const e0 = escenarioInicial();
    const e1 = ok(solicitarRedencion(e0, { monto: 150_000_00, tenedor: 'T', ahora: AHORA }));
    const id = e1.operaciones.at(-1)!.id;
    expect(e1.operaciones.at(-1)!.estado).toBe('Pendiente de fondos');
    expect(e1.pendientesDeQuema).toBe(150_000_00);
    expect(e1.circulacion).toBe(e0.circulacion);
    expect(activa(e1, 3)).toBe(true);
    expect(pagarRedencion(e1, { id, ahora: AHORA }).ok).toBe(false);

    const e2 = ok(agregarLiquidez(e1, { monto: 60_000_00, ahora: AHORA }));
    const e3 = ok(pagarRedencion(e2, { id, ahora: AHORA }));
    expect(e3.operaciones.at(-1)!.estado).toBe('Incompleta');
    expect(e3.pendientesDeQuema).toBe(0);
    expect(e3.circulacion).toBe(e0.circulacion - 150_000_00);
    expect(activa(e3, 3)).toBe(false);
    expect(sumaPartidasBanco(e3)).toBe(e3.banco);
  });

  it('no se puede redimir más de lo que circula sin apartar', () => {
    const e = escenarioInicial();
    expect(solicitarRedencion(e, { monto: e.circulacion + 1, tenedor: 'T', ahora: AHORA }).ok).toBe(false);
  });
});

describe('tesorería', () => {
  it('una conversión pendiente no se suma; al confirmarla pasa de CETES a banco', () => {
    const e0 = escenarioInicial();
    const e1 = ok(solicitarConversion(e0, { monto: 20_000_00, ahora: AHORA }));
    expect(respaldoTotal(e1)).toBe(respaldoTotal(e0));
    expect(e1.banco).toBe(e0.banco);
    const e2 = ok(confirmarConversion(e1, { id: 'CV-02', ahora: AHORA }));
    expect(e2.cetes).toBe(e0.cetes - 20_000_00);
    expect(e2.banco).toBe(e0.banco + 20_000_00);
    expect(respaldoTotal(e2)).toBe(respaldoTotal(e0));
    expect(sumaPartidasBanco(e2)).toBe(e2.banco);
  });

  it('no se convierte más de lo disponible (descontando lo ya pendiente)', () => {
    const e = escenarioInicial();
    expect(solicitarConversion(e, { monto: e.cetes - 50_000_00 + 1, ahora: AHORA }).ok).toBe(false);
  });
});

describe('discrepancias', () => {
  it('identificar el depósito lo suma al banco', () => {
    const e0 = escenarioInicial();
    const e1 = ok(resolverDiscrepancia(e0, { id: 'D-02', ahora: AHORA }));
    expect(e1.banco).toBe(e0.banco + 25_000_00);
    expect(sumaPartidasBanco(e1)).toBe(e1.banco);
  });

  it('una quema sin pago solo se resuelve con el CEP', () => {
    expect(resolverDiscrepancia(escenarioInicial(), { id: 'D-01', ahora: AHORA }).ok).toBe(false);
    const e = ok(confirmarCep(escenarioInicial(), { id: 'OP-0002', ahora: AHORA }));
    expect(e.discrepancias.find((d) => d.id === 'D-01')!.estado).toBe('resuelta');
    expect(activa(e, 4)).toBe(false);
  });
});
