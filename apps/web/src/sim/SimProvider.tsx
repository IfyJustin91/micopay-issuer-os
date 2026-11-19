import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { Resultado } from './acciones';
import { escenarioInicial } from './escenario';
import type { Estado } from './modelo';

/* Estado del simulador para toda la app. Se guarda en el navegador para que
   sobreviva a una recarga; si el almacenamiento falla o trae otra versión,
   se arranca del escenario inicial. Nada sale del navegador. */

const CLAVE = 'issuer-os-sim-v1';

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
      const e = JSON.parse(raw) as Estado;
      if (e?.version === 1) return e;
    }
  } catch { /* storage unavailable or corrupt: use the initial scenario */ }
  return escenarioInicial();
}

function guardar(e: Estado) {
  try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch { /* ignore */ }
}

interface Sim {
  estado: Estado;
  /** Aplica una acción. Devuelve el mensaje de error, o null si se aplicó. */
  ejecutar: (accion: (e: Estado) => Resultado) => string | null;
  reiniciar: () => void;
}

const Contexto = createContext<Sim | null>(null);

export function SimProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(cargar);

  const ejecutar = useCallback((accion: (e: Estado) => Resultado) => {
    const r = accion(estado);
    if (!r.ok) return r.error;
    setEstado(r.estado);
    guardar(r.estado);
    return null;
  }, [estado]);

  const reiniciar = useCallback(() => {
    const e = escenarioInicial();
    setEstado(e);
    guardar(e);
  }, []);

  return <Contexto.Provider value={{ estado, ejecutar, reiniciar }}>{children}</Contexto.Provider>;
}

export function useSim(): Sim {
  const s = useContext(Contexto);
  if (!s) throw new Error('useSim must be used inside <SimProvider>');
  return s;
}
