import type { ReactNode } from 'react';

/* Piezas de pantalla copiadas de micopay-cafe (apps/web/src/comun.tsx), sin las
   que son propias de café (créditos, pagos, hashes de testnet). */

export function Titulo({ cintillo, children, accion }: { cintillo: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="inline-block bg-tinta text-papel px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.14em] leading-none">{cintillo}</span>
        <h1 className="mt-3 font-display text-[32px] md:text-[38px] font-extrabold leading-[1.02] tracking-[-.02em]" style={{ fontVariationSettings: '"wdth" 112' }}>
          {children}
        </h1>
      </div>
      {accion}
    </header>
  );
}

export function Subtitulo({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-[21px] font-extrabold" style={{ fontVariationSettings: '"wdth" 108' }}>{children}</h2>
      {accion}
    </div>
  );
}

export function Aviso({ children, tono = 'verde' }: { children: ReactNode; tono?: 'verde' | 'aviso' }) {
  const c = tono === 'verde' ? 'bg-verde-suave' : 'bg-aviso border-aviso-borde text-aviso-texto';
  return <div className={`border-2 border-tinta ${c} px-4 py-3 rounded-sm text-[14px]`}>{children}</div>;
}

/** Plain bordered surface without the Card padding, for tables and panels with a header bar. */
export function Panel({ children, sombra = false, className = '' }: { children: ReactNode; sombra?: boolean; className?: string }) {
  return <div className={`rounded-sm border-2 border-tinta bg-papel overflow-hidden ${sombra ? 'shadow-solida' : ''} ${className}`}>{children}</div>;
}

export function BarraPanel({ children }: { children: ReactNode }) {
  return <div className="bg-tinta text-papel px-5 py-3 text-[12px] font-bold uppercase tracking-[.14em]">{children}</div>;
}

export function Tabla({ cabeceras, children, vacio }: { cabeceras: Array<string | { t: string; derecha?: boolean }>; children: ReactNode; vacio?: string | false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead className="bg-tinta text-papel text-left text-[11px] uppercase tracking-[.12em]">
          <tr>{cabeceras.map((c) => {
            const t = typeof c === 'string' ? { t: c } : c;
            return <th key={t.t} className={`px-3 py-3 font-bold whitespace-nowrap ${t.derecha ? 'text-right' : ''}`}>{t.t}</th>;
          })}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {vacio && <p className="px-4 py-6 text-gris text-[14px]">{vacio}</p>}
    </div>
  );
}

export const td = 'px-3 py-2.5 border-t border-linea align-top';
export const tdNum = `${td} text-right num whitespace-nowrap`;

export function Dato({ etiqueta, valor, tono = '' }: { etiqueta: string; valor: ReactNode; tono?: string }) {
  return (
    <div className="rounded-sm border-2 border-tinta bg-papel p-4">
      <div className="text-[11px] font-bold uppercase tracking-[.12em] text-gris">{etiqueta}</div>
      <div className={`num mt-1.5 font-display text-[22px] font-extrabold leading-none ${tono}`} style={{ fontVariationSettings: '"wdth" 106' }}>{valor}</div>
    </div>
  );
}
