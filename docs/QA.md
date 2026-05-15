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
- Each row shows best route, provider sequence, final delivered amount, and direct-route comparison.

## Automated Tests

Run:

```bash
npm test
```

Expected:

- All Vitest unit tests pass.
- Tests cover route simulation, ranking, direct comparison, static edge normalization, invalid route filtering, and no-route behavior.
