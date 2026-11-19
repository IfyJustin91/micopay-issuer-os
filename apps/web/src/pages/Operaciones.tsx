import { Link } from 'react-router-dom';
import { Panel, Tabla, Titulo, td, tdNum } from '../comun';
import { operaciones } from '../ejemplos/operaciones';
import { token } from '../format';
import { t } from '../i18n';
import { Badge } from '../ui';

/** Plain index of the example operations, so every detail route is reachable. */
export default function Operaciones() {
  return (
    <>
      <Titulo cintillo={t('Emisor')}>{t('Operaciones')}</Titulo>
      <Panel>
        <Tabla cabeceras={[t('Folio'), t('Tipo'), t('Estado'), { t: t('Monto'), derecha: true }]}>
          {operaciones.map((o) => (
            <tr key={o.id}>
              <td className={td}><Link to={`/operaciones/${o.id}`} className="inline-flex min-h-12 items-center font-bold underline num whitespace-nowrap">{o.id}</Link></td>
              <td className={td}>{t(o.tipo)}</td>
              <td className={td}><Badge tono={o.estado === 'Completa' ? 'verde' : 'aviso'}>{t(o.estado)}</Badge></td>
              <td className={tdNum}>{token(o.monto)} {o.unidad}</td>
            </tr>
          ))}
        </Tabla>
      </Panel>
    </>
  );
}
