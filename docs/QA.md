# QA Plan

Manual and automated QA for the Multi-Leg FX Routing Tool.

## Valid Route Tests

### Happy Path: GBP to JPY

Input:

- Source: GBP
- Target: JPY
- Amount: 1000

Expected:

- Top 3 routes appear.
- Each route has no more than 3 legs.
- Final delivered amount is in JPY.
- Each leg shows provider, input, rate, fee, amount after fee, and output.
- Provider Health appears.
- Amount Sensitivity appears.
- Each route shows effective rate, complexity, plain-English explanation, and Copy Summary button.

### Direct Route Comparison: USD to CAD

Input:

- Source: USD
- Target: CAD
- Amount: 10000

Expected:

- Routes display difference versus best direct route when direct routes exist.
- Direct route difference should be `+0.00` or close to zero for the best direct route.

### Stablecoin Route: EUR to USDC

Input:

- Source: EUR
- Target: USDC
- Amount: 5000

Expected:

- Static stablecoin providers can appear in route legs.
- Stablecoin venues show `Static loaded` in Provider Health.

## Invalid Input Tests

### Negative Amount

Input:

- Source: USD
- Target: CAD
- Amount: -100

Expected:

- UI shows a validation error.
- API request is not submitted from the browser form.

### Same Source And Target

Input:

- Source: USD
- Target: USD
- Amount: 1000

Expected:

- UI shows `Source and target currencies must be different.`

### Missing Currency

Input:

- Source: blank
- Target: JPY
- Amount: 1000

Expected:

- UI shows `Source currency is required.`

## Provider Failure Tests

### Provider Timeout

Simulated condition:

- One live provider API times out.

Expected:

- App still returns routes from other providers when possible.
- Provider Health shows timeout or failed status for the unavailable provider.
- Warning message appears.

### Malformed Provider Response

Simulated condition:

- Provider returns a response without a valid `rates` object.

Expected:

- Provider is excluded.
- Provider Health shows malformed response.
- Other providers continue to calculate routes.

## No-Route Tests

### Unsupported Currency

Input:

- Source: XYZ
- Target: JPY
- Amount: 1000

Expected:

- API returns a clear unsupported or unavailable currency error.
- UI displays the error without crashing.

### No Valid Route

Input:

- Source and target are supported individually, but no path exists within 3 legs.

Expected:

- UI shows `No valid routes found for this currency pair.`

## Fee Edge Cases

### Small Amount Flat Fee Impact

Input:

- Source: CAD
- Target: AUD
- Amount: 100

Expected:

- High-flat-fee routes are penalized.
- Routes where the fee exceeds or equals the leg input are discarded.

### Large Amount Percent Fee Impact

Input:

- Source: USD
- Target: CAD
- Amount: 100000

Expected:

- Percentage fees scale with the route amount.
- Amount Sensitivity may show a different winner than a small transfer.

## Amount Sensitivity Tests

Input:

- Source: GBP
- Target: JPY
- Amount: 1000

Expected:

- Sensitivity rows appear for 100, 1000, 10000, and 100000.
- Each row shows best route, provider sequence, final delivered amount, effective rate, and direct-route comparison.

## Next-Step Feature Tests

### Trade Review Summary

Input:

- Source: GBP
- Target: JPY
- Amount: 1000

Expected:

- Overview tab starts with Trade Review Summary.
- Summary shows order, recommended route, final delivered amount, effective rate, direct comparison, provider coverage, result quality, complexity, leg count, provider count, warning count, and decision-support note.

### Provider Coverage And Result Quality

Action:

- Run a successful calculation.
- Disable one provider.
- Disable several providers.

Expected:

- Provider Coverage decreases as providers are disabled.
- Result Quality updates from High Coverage to Partial or Limited Coverage as coverage drops.
- Diagnostics and Provider Health show the same coverage and quality values.

### Reset Demo

Action:

- Run a calculation.
- Change filters.
- Disable a provider.
- Click Reset Demo.

Expected:

- Source returns to GBP.
- Target returns to JPY.
- Amount returns to 1000.
- Filters return to all and max 3 legs.
- Disabled providers are cleared.
- Current result and error are cleared.
- Active tab returns to Overview.
- Recent searches are not cleared.

### Effective Rate

Input:

- Source: GBP
- Target: JPY
- Amount: 1000

Expected:

- Each route displays effective rate as final delivered JPY divided by 1000 GBP.
- Effective rate updates after changing amount or currency pair.

### Complexity Label

Input:

- Any direct one-leg fiat route.

Expected:

- Route shows Low Complexity and gives reasons such as `1 leg` and `1 provider`.

Input:

- A three-leg route using USDT or USDC.

Expected:

- Route shows High Complexity and mentions stablecoin usage or multiple legs.

### Copy Summary

Action:

- Click Copy Summary on Route #1.

Expected:

- Clipboard receives a formatted summary with path, final amount, effective rate, complexity, and explanation.
- UI shows `Copied`.

### Saved Scenario

Action:

- Click `GBP -> JPY` in Try an example.

Expected:

- Form fills with GBP, JPY, and 1000.
- Route calculation runs automatically.

### Provider Outage Toggle

Action:

- Disable BetaBank.

Expected:

- BetaBank is excluded from route generation.
- Provider Health shows BetaBank as simulated outage.
- Warning says BetaBank was manually disabled.
- Routes recalculate using remaining providers.

### All Providers Disabled

Action:

- Disable all six providers.

Expected:

- No routes are returned.
- Provider Health shows all providers as simulated outage.
- Clear no-route message explains all providers are disabled.

## Automated Tests

Run:

```bash
npm test
```

Expected:

- All Vitest unit tests pass.
- Tests cover route simulation, ranking, direct comparison, static edge normalization, invalid route filtering, no-route behavior, route insights, summary formatting, disabled-provider filtering, provider coverage, and result quality.
