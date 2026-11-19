import type { ReactNode } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Titulo } from './comun';
import { emisor } from './ejemplos/emisor';
import { lang, setLang, t } from './i18n';
import { useSim } from './sim/SimProvider';
import { Icon } from './ui';
import Tablero from './pages/Tablero';
import Operaciones from './pages/Operaciones';
import OperacionDetalle from './pages/OperacionDetalle';
import Discrepancias from './pages/Discrepancias';

/* Marca: el logotipo de MicoPay (Logo.tsx de la app) con el producto como sufijo,
   igual que en micopay-cafe. */
export function Marca({ tone = 'claro' }: { tone?: 'claro' | 'oscuro' }) {
  const tinta = tone === 'oscuro' ? 'var(--color-papel)' : 'var(--color-tinta)';
  const naranja = tone === 'oscuro' ? 'var(--color-naranja-claro)' : 'var(--color-naranja)';
  return (
    <div className="flex items-center gap-2.5">
      <svg fill="none" height="26" width="26" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <circle cx="7" cy="7" r="3" stroke={tinta} strokeWidth="2.5" />
        <circle cx="17" cy="17" r="3" stroke={naranja} strokeWidth="2.5" />
        <path d="M10 10L14 14" stroke={tinta} strokeLinecap="round" strokeWidth="2.5" />
      </svg>
      <div className="font-display text-[20px] font-extrabold uppercase tracking-[-.02em] leading-none" style={{ fontVariationSettings: '"wdth" 112' }} translate="no">
        <span style={{ color: tinta }}>Mico</span>
        <span style={{ color: naranja }}>Pay</span>
        {/* "Issuer OS" no cabe junto al logotipo en la barra de 256 px: va en su propia línea. */}
        <span className="mt-1 block text-[13px] tracking-[.14em] whitespace-nowrap" style={{ color: tone === 'oscuro' ? 'var(--color-gris-3)' : 'var(--color-gris)' }}>Issuer OS</span>
      </div>
    </div>
  );
}

const NAV = [
  { to: '/', icon: 'home', label: 'Tablero' },
  { to: '/operaciones', icon: 'receipt_long', label: 'Operaciones' },
  { to: '/discrepancias', icon: 'verified_user', label: 'Discrepancias' },
];

/** Shown on every view: the whole prototype runs on fictitious data. */
function AvisoPrototipo() {
  return (
    <div role="note" className="mb-6 border-2 border-tinta bg-aviso text-aviso-texto px-4 py-3 rounded-sm text-[14px]">
      <div className="font-bold uppercase tracking-[.1em] text-[12px]">{t('Prototipo con datos ficticios')}</div>
      <p className="mt-1">{t('Nada de esta pantalla es real: ni el emisor, ni el activo, ni las reservas, ni las operaciones. Las cifras y las reglas son supuestos de ejemplo, no políticas del producto. MicoPay no emite ni custodia este activo.')}</p>
    </div>
  );
}

/** Back to the initial scenario. Asks first: everything done in the mock-up is lost. */
function Reiniciar() {
  const { reiniciar } = useSim();
  return (
    <button type="button" onClick={() => { if (window.confirm(t('¿Volver al escenario inicial? Se pierde todo lo que hiciste en la maqueta.'))) reiniciar(); }}
      className="flex min-h-12 shrink-0 items-center gap-3 px-5 py-3 text-[15px] font-bold whitespace-nowrap text-gris-3 md:mt-auto md:border-t-2 md:border-tinta-3">
      <Icon name="history_toggle_off" /> {t('Reiniciar escenario')}
    </button>
  );
}

function Encabezado() {
  const a = emisor.activo;
  const campos: Array<[string, string]> = [
    [t('Activo'), a.codigo],
    [t('Red'), a.red],
    [t('Cuenta emisora'), a.cuentaEmisora],
    [t('Contrato'), a.contrato],
  ];
  return (
    <div className="mb-7 border-b-2 border-tinta pb-4">
      <div className="text-[11px] font-bold uppercase tracking-[.14em] text-gris">{t('Emisor')}</div>
      <div className="font-bold text-[16px]">{emisor.nombre}</div>
      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-gris">
        {campos.map(([k, v]) => (
          <div key={k} className="flex gap-1.5 min-w-0">
            <dt>{k}</dt>
            <dd className="num font-bold text-tinta break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[256px_1fr]">
      <aside className="bg-tinta text-papel md:sticky md:top-0 md:h-dvh flex md:flex-col overflow-x-auto no-scrollbar">
        <div className="px-5 py-5 border-b-2 border-tinta-3 hidden md:block"><Marca tone="oscuro" /></div>
        <nav className="flex md:flex-col md:py-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) => `flex min-h-12 items-center gap-3 px-5 py-3 text-[15px] font-bold whitespace-nowrap border-l-4 ${isActive ? 'border-naranja-claro bg-tinta-2 text-papel' : 'border-transparent text-gris-3'}`}>
              {({ isActive }) => (<><Icon name={n.icon} filled={isActive} /> {t(n.label)}</>)}
            </NavLink>
          ))}
        </nav>
        <Reiniciar />
        <div className="hidden md:flex px-5 py-4 border-t-2 border-tinta-3 gap-2" role="group" aria-label="Language">
          {(['es', 'en'] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
              className={`min-h-12 rounded-sm border-2 px-3 py-1 text-[13px] font-bold uppercase ${lang === l ? 'bg-papel text-tinta border-papel' : 'border-tinta-3 text-gris-3'}`}>{l}</button>
          ))}
        </div>
      </aside>
      <main className="px-4 py-6 md:px-10 md:py-8 max-w-[1200px] w-full min-w-0">
        <AvisoPrototipo />
        <Encabezado />
        {children}
      </main>
    </div>
  );
}

function NoEncontrada() {
  return (
    <>
      <Titulo cintillo="404">{t('Página no encontrada')}</Titulo>
      <Link to="/" className="inline-flex min-h-12 items-center font-bold underline">{t('Ir al tablero')}</Link>
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Tablero />} />
        <Route path="/operaciones" element={<Operaciones />} />
        <Route path="/operaciones/:id" element={<OperacionDetalle />} />
        <Route path="/discrepancias" element={<Discrepancias />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </Layout>
  );
}
