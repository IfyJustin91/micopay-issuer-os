import { Aviso } from '../comun';
import { t } from '../i18n';

/** Placeholder for a view that a later issue builds on top of its example file. */
export default function VistaPendiente({ issue, archivo }: { issue: string; archivo: string }) {
  return (
    <Aviso tono="aviso">
      <div className="font-bold">{t('Vista pendiente')}</div>
      <p className="mt-1">{t('Esta vista se construye en {issue}. Los datos de ejemplo ya están en {archivo}.', { issue, archivo })}</p>
    </Aviso>
  );
}
