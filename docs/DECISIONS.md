# Decision Log

## Decision: Bounded Enumeration Instead Of Dijkstra

I chose bounded exhaustive route enumeration because routes are limited to 3 legs. This makes the algorithm simple, testable, and easy to explain. Dijkstra is more useful for larger graphs, but here each edge's impact depends on the changing amount after previous fees, so route simulation is required either way.

## Decision: Normalize Providers Into A Common Edge Type

Live fiat APIs and static stablecoin venues all produce different data shapes. I normalize them into the same `Edge` type before routing. This keeps provider-specific parsing out of the route engine and makes tests easier to write.

## Decision: Skip Failed Providers Instead Of Failing The Whole Request

The PRD asks the tool to return useful results when a provider is unavailable. Each live provider fetch is isolated. If a provider times out, returns malformed data, or fails, the app excludes that provider's missing edges and still evaluates the rest.

## Decision: Apply Fees Before Conversion

Fees are charged in the source currency of the leg, so the app subtracts percentage plus flat fee before applying the exchange rate. This matches the assignment formula and avoids overstating output amounts.

## Decision: Keep Routing Logic Separate From UI

Route generation, simulation, ranking, provider loading, and API normalization live under `src/lib`. The React UI calls the API and renders results. This separation keeps the core business logic testable and prevents frontend state from becoming the source of truth.

## Decision: Cache Live API Responses Briefly

Live rates are cached in memory for 10 minutes. This keeps route calculation responsive, reduces repeated calls during demos, and lowers the chance of hitting free API rate limits. For a production system, this would move to a shared cache with expiry metadata.

## Decision: Show Provider Health As A First-Class Result

FX routing results are only useful if the user understands which providers were included. The API returns `providerHealth` with status, loaded edge count, and message. The UI shows this beside the route results so warnings are visible without blocking successful calculations.

## Decision: Add Amount Sensitivity

Flat fees and percentage fees affect small and large transfers differently. The amount sensitivity view recalculates the best route at 100, 1000, 10000, and 100000 using the same edge set. This makes the business logic visible to an operations or trading reviewer.

## Decision: Use A Vitest Launcher On Windows

The project folder contains `#`, and Vite can misread that character in Windows paths. I added `scripts/run-vitest.cjs` to resolve a short Windows path before launching Vitest. This keeps the test suite runnable without renaming the assignment folder.
