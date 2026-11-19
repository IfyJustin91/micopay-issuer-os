/* Simulador de la maqueta — indicadores (PROJECT.md §8). Las pantallas los
   leen de aquí; no los calculan por su cuenta. */

import type { Centavos, Estado } from './modelo';

/** Pasivo: tokens en circulación, incluidos los apartados para quemar. */
export const pasivo = (e: Estado): Centavos => e.circulacion;
/** CETES + banco. Las conversiones pendientes y los depósitos no identificados no se suman. */
export const respaldoTotal = (e: Estado): Centavos => e.cetes + e.banco;
/** Respaldo total / pasivo. Infinity sin pasivo. */
export const cobertura = (e: Estado): number => (e.circulacion === 0 ? Infinity : respaldoTotal(e) / e.circulacion);
/** Saldo bancario / pasivo. */
export const coberturaLiquida = (e: Estado): number => (e.circulacion === 0 ? Infinity : e.banco / e.circulacion);
export const conversionesPendientes = (e: Estado): Centavos =>
  e.conversiones.filter((c) => c.estado === 'pendiente').reduce((s, c) => s + c.monto, 0);
export const disponibleParaConvertir = (e: Estado): Centavos => e.cetes - conversionesPendientes(e);
export const redimible = (e: Estado): Centavos => e.circulacion - e.pendientesDeQuema;
export const solicitudesPendientes = (e: Estado) => e.operaciones.filter((o) => o.estado !== 'Completa');
export const discrepanciasAbiertas = (e: Estado) => e.discrepancias.filter((d) => d.estado === 'abierta');
/** Suma de las partidas del banco: debe ser igual al saldo (PROJECT.md §15). */
export const sumaPartidasBanco = (e: Estado): Centavos => e.partidasBanco.reduce((s, p) => s + p.monto, 0);

export interface EstadoRegla {
  id: 1 | 2 | 3 | 4;
  regla: string;
  efecto: string;
  base: string;
  activa: boolean;
}

/** Las cuatro reglas de ejemplo y si están activas ahora. Son supuestos, no políticas del producto. */
export function reglas(e: Estado): EstadoRegla[] {
  return [
    { id: 1, regla: 'Sin evidencia del depósito', efecto: 'No se emite', base: 'README.md (principio 4) y PROJECT.md §15', activa: false },
    { id: 2, regla: 'Respaldo total menor a 100 %', efecto: 'Bloquea nuevas emisiones', base: 'Política ficticia del ejemplo', activa: cobertura(e) < 1 },
    { id: 3, regla: 'Saldo bancario insuficiente para una redención', efecto: 'La redención queda pendiente de fondos, con alerta', base: 'Política ficticia del ejemplo; la real no está documentada (PROJECT.md §18)', activa: e.operaciones.some((o) => o.estado === 'Pendiente de fondos') },
    { id: 4, regla: 'Quema sin pago SPEI confirmado', efecto: 'Discrepancia; la redención queda incompleta', base: 'PROJECT.md §6 y §15', activa: e.discrepancias.some((d) => d.estado === 'abierta' && d.tipo === 'Quema sin pago de redención') },
  ];
}
