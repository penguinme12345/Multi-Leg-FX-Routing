# Multi-Leg FX Routing Tool

Internal routing tool for comparing direct and multi-leg FX paths across liquidity providers. The app accepts a source currency, target currency, and amount, then returns the top 3 valid routes ranked by final delivered amount after provider rates and per-leg fees.

## Links

- Live deployment: not deployed from this local workspace yet
- GitHub repository: add the public repository URL after pushing

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```

## Routing Model

The FX problem is modeled as a directed graph. Currencies are nodes, and provider quotes are edges containing provider name, rate, percentage fee, and flat fee. Since the PRD caps routes at 3 legs, the app uses bounded exhaustive route enumeration instead of Dijkstra. Every candidate route is simulated leg by leg:

```text
total_fee = leg_amount * fee_percent + fee_flat
amount_after_fee = leg_amount - total_fee
output_amount = amount_after_fee * rate
```

Routes where fees consume the full leg input are discarded. Remaining routes are sorted by final delivered amount, and each top route is compared against the best direct route when a direct route exists.

## Providers

Provider configuration is loaded from `providers.json`.

- AlphaFX: Frankfurter API
- BetaBank: ExchangeRate-API open access
- DeltaMarkets: fawazahmed0 currency-api
- GammaCrypto: static stablecoin venue
- EpsilonChain: static stablecoin venue
- ZetaSwap: static stablecoin venue

Live provider calls use timeouts and in-memory caching. If one provider fails, the route calculation skips that provider, continues with the remaining edges, and returns warnings to the UI.

## Assumptions

- Fees are charged in the source currency of each leg.
- Percentage and flat fees both apply on every leg.
- Flat fees are applied before conversion.
- Live fiat providers are fetched for the source, target, configured fiat currencies, and common hubs.
- Static stablecoin rates are trusted as provided in `providers.json`.
- The first version does not execute trades, persist history, or authenticate users.

## API

```text
POST /api/routes
```

Request:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000
}
```

Response includes normalized input, top routes, per-leg breakdowns, warnings, and direct-route comparison values.

## AI Tools Used

AI assistance was used to structure the Next.js project, implement the bounded route enumeration approach, generate TypeScript types, and check edge cases around fee calculation and provider failure handling. The implementation was reviewed and adjusted around provider normalization, runtime `providers.json` validation, and route simulation.

## One Thing AI Got Wrong

An early direction could have been to use a shortest-path algorithm immediately. That does not fit this case as well because route length is capped at 3 legs and fees depend on the changing amount after each conversion. Bounded exhaustive search is simpler to verify and better aligned with the PRD.

## With More Time

I would add automated route-engine tests, historical rate caching, a route graph visualization, and an amount-scaling view to show how flat fees affect small versus large transfers.
