/* Escenario de ejemplo (ficticio) — identidad del emisor y de su activo.
   Lo usa el encabezado de todas las vistas.

   "Emisora Ejemplo" es un emisor TERCERO inventado: no es MicoPay ni ninguna
   empresa real. El activo se identifica por red, cuenta emisora, contrato y
   código (PROJECT.md §9; Micopay/.github docs/ECOSYSTEM.md §8.1). Los valores
   son a propósito imposibles en Stellar, para que nadie los confunda con una
   cuenta real.

   El estado que cambia (tokens, reservas, operaciones, discrepancias) vive en
   el simulador, src/sim/. */

export interface EmisorEjemplo {
  nombre: string;
  activo: {
    codigo: string;
    red: string;
    cuentaEmisora: string;
    contrato: string;
  };
}

export const emisor: EmisorEjemplo = {
  nombre: 'Emisora Ejemplo',
  activo: {
    codigo: 'MXEJ',
    red: 'Stellar testnet (ficticia)',
    cuentaEmisora: 'G-EJEMPLO-EMISORA-NO-EXISTE',
    contrato: 'C-EJEMPLO-CONTRATO-NO-EXISTE',
  },
};
