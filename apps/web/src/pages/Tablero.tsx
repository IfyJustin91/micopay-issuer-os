import { Titulo } from '../comun';
import { t } from '../i18n';
import VistaPendiente from './VistaPendiente';

export default function Tablero() {
  return (
    <>
      <Titulo cintillo={t('Emisor')}>{t('Tablero')}</Titulo>
      <VistaPendiente issue="IOS-1" archivo="src/sim/" />
    </>
  );
}
