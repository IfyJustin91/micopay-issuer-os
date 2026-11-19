/**
 * Minimal i18n, same mechanism as micopay-cafe: keys are the Spanish strings,
 * English is the default language and `?lang=` wins over the saved choice.
 * `{name}` placeholders are interpolated. Unknown strings fall back to themselves.
 */
export type Lang = 'es' | 'en';

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'es' || q === 'en') { localStorage.setItem('lang', q); return q; }
    const saved = localStorage.getItem('lang');
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* storage unavailable: use default */ }
  return 'en';
}

export const lang: Lang = initialLang();
export const locale = lang === 'en' ? 'en-US' : 'es-MX';

export function setLang(l: Lang) {
  try { localStorage.setItem('lang', l); } catch { /* ignore */ }
  const url = new URL(window.location.href);
  url.searchParams.delete('lang');
  window.location.replace(url.toString());
}

export function t(s: string, vars?: Record<string, string | number>): string {
  let out = lang === 'en' ? EN[s] ?? s : s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

const EN: Record<string, string> = {
  // chrome
  'Emisor': 'Issuer',
  'Tablero': 'Dashboard',
  'Operaciones': 'Operations',
  'Discrepancias': 'Discrepancies',
  'Activo': 'Asset',
  'Red': 'Network',
  'Cuenta emisora': 'Issuing account',
  'Contrato': 'Contract',
  'Prototipo con datos ficticios': 'Prototype with fictitious data',
  'Nada de esta pantalla es real: ni el emisor, ni el activo, ni las reservas, ni las operaciones. Las cifras y las reglas son supuestos de ejemplo, no políticas del producto. MicoPay no emite ni custodia este activo.':
    'Nothing on this screen is real: not the issuer, the asset, the reserves or the operations. Figures and rules are example assumptions, not product policies. MicoPay does not issue or hold this asset.',
  // placeholders
  'Vista pendiente': 'View pending',
  'Esta vista se construye en {issue}. El estado y las acciones del simulador ya están en {archivo}.': 'This view is built in {issue}. The simulator state and actions are already in {archivo}.',
  'Reiniciar escenario': 'Reset scenario',
  '¿Volver al escenario inicial? Se pierde todo lo que hiciste en la maqueta.': 'Go back to the initial scenario? Everything you did in the mock-up is lost.',
  'Redención con SPEI': 'Redemption via SPEI',
  'Pendiente de fondos': 'Pending funds',
  'Detalle de operación': 'Operation detail',
  'Operación {id}': 'Operation {id}',
  'No existe una operación {id} en el ejemplo.': 'There is no operation {id} in the example.',
  'Ver todas las operaciones': 'See all operations',
  'Página no encontrada': 'Page not found',
  'Ir al tablero': 'Go to the dashboard',
  'Folio': 'ID',
  'Tipo': 'Type',
  'Estado': 'Status',
  'Monto': 'Amount',
  // operation types and statuses (example data)
  'Emisión': 'Issuance',
  'Pago de café': 'Coffee payment',
  'Completa': 'Complete',
  'Incompleta': 'Incomplete',
};
