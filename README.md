# MicoPay Issuer OS

Modular infrastructure that lets companies and institutions issue, operate, reconcile and audit backed digital assets, without requiring MicoPay to custody every participant's reserves.

> Status: architecture proposal under review. This repository does not yet represent a deployed product or a regulated offering.

## Core idea

MicoPay Issuer OS aims to act as a control tower between:

- assets issued on Stellar;
- reserves managed by each issuer or by an authorized custodian;
- liquidity and asset providers, such as Etherfuse;
- inflows and outflows through SPEI;
- accounting, reconciliation, compliance and auditing;
- end products such as MicoPay Coffee, wallets and rewards programs.

```text
                         MicoPay Issuer OS
                  policies · accounting · audit
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   Stellar / tokens    Reserves / Etherfuse   SPEI / banks
   issuance and burn    CETES and liquidity   inflow and outflow
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
             Coffee · wallets · issuers · merchants
```

## Principles

1. **Per-issuer separation.** Reserves, liabilities, keys and records are never commingled across organizations.
2. **Explicit custody.** Each asset declares who custodies, who issues, who signs and who guarantees redemption.
3. **Three-way reconciliation.** On-chain supply, the issuer's books and the reserves must match.
4. **No issuance without confirmed backing.** The issuance policy must depend on durable evidence and verifiable authorizations.
5. **No reserve release without a confirmed burn.** A redemption only completes when both legs of the operation are final.
6. **Composable infrastructure.** Stellar, Etherfuse, banks, custodians and identity providers are integrated through replaceable adapters.
7. **ISO 20022 as the internal language.** Its semantic model is adopted without requiring every internal API to use XML.
8. **Self-custody where possible.** Regulated custody is added as an explicit mode, not an accidental one.

## What we reuse

- Stellar native assets and the Stellar Asset Contract.
- Separate issuing and distribution accounts, multisig and authorization controls.
- Stellar Anchor Platform and the SEPs for authentication, KYC, deposits, withdrawals and quotes.
- Etherfuse for CETES, MXN liquidity and SPEI connectivity, subject to contractual availability.
- The MicoPay APK for identity, wallet and signing protected by Android Keystore.
- MicoPay's existing backend and escrow as independent components, not as the issuer's ledger.

## What remains to be built

- double-entry ledger with per-issuer subledgers;
- reconciliation engine across Stellar, reserves and SPEI;
- controlled issuance, burn and redemption flows;
- dashboard for assets, liabilities, coverage and liquidity;
- approval policy, limits and segregation of duties;
- audit portal with evidence of reserves and liabilities;
- adapters for custodians, banks and asset providers;
- Mexico-specific accounting and regulatory exports;
- canonical model compatible with ISO 20022.

## Documentation

The full definition, scope, initial architecture, risks and phases are in [PROJECT.md](./PROJECT.md).

## Prototype

`apps/web` is a clickable mock-up for showing the idea to a possible issuer or auditor. It is **not** the product and it does not fix the data model, which is still open (PROJECT.md §18).

- **Everything is fictitious.** A made-up third-party issuer, "Emisora Ejemplo", issues a peso token called `MXEJ`. Its main reserve is Etherfuse tokenized CETES, and it keeps a bank balance for paying out by SPEI. There are no real accounts, keys or network calls.
- **Each screen has its own example file**, in `apps/web/src/ejemplos/`. They are not a shared schema.
  - `tablero.ts`: dashboard figures, positions and a sample balance that can be traced to its entries.
  - `operaciones.ts`: an issuance, an incomplete SPEI redemption and a coffee payment.
  - `discrepancias.ts`: pre-classified discrepancies and the example blocking rules.
- **Figures and rules are example assumptions**, not product policies. MicoPay does not issue or hold this asset.
- **Design** comes from the MicoPay app (tokens, `ui/` components and bundled fonts), copied from micopay-cafe. Do not edit the token layer here.
- **Languages:** Spanish strings are the keys and English is the default. Add `?lang=es` to the URL for Spanish.

Run it with Node 22:

```bash
npm ci
npm run dev        # http://localhost:5190
npm run typecheck
npm run build
```

## Limitations

This project describes financial software. It does not replace the legal, accounting, tax or regulatory analysis of each issuer. Responsibility for reserves, redemption, custody and compliance must be assigned contractually and reflected technically in each deployment.

## Proposal date

October 30, 2026.
