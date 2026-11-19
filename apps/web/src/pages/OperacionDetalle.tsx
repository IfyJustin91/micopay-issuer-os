import { Link, useParams } from 'react-router-dom';
import { Aviso, Titulo } from '../comun';
import { t } from '../i18n';
import { useSim } from '../sim/SimProvider';
import VistaPendiente from './VistaPendiente';

export default function OperacionDetalle() {
  const { id = '' } = useParams();
  const { operaciones } = useSim().estado;
  const existe = operaciones.some((o) => o.id === id);
  return (
    <>
      <Titulo cintillo={t('Detalle de operación')}>{t('Operación {id}', { id })}</Titulo>
      {existe ? (
        <VistaPendiente issue="IOS-2" archivo="src/sim/" />
      ) : (
        <Aviso tono="aviso">
          <p>{t('No existe una operación {id} en el ejemplo.', { id })}</p>
          <Link to="/operaciones" className="mt-1 inline-flex min-h-12 items-center font-bold underline">{t('Ver todas las operaciones')}</Link>
        </Aviso>
      )}
    </>
  );
}
