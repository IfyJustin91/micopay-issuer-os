import { Titulo } from '../comun';
import { t } from '../i18n';
import VistaPendiente from './VistaPendiente';

export default function Discrepancias() {
  return (
    <>
      <Titulo cintillo={t('Emisor')}>{t('Discrepancias')}</Titulo>
      <VistaPendiente issue="IOS-3" archivo="src/ejemplos/discrepancias.ts" />
    </>
  );
}
