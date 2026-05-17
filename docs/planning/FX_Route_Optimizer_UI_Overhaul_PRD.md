# PRD.md

# FX Route Optimizer UI Overhaul

## 1. Purpose

This PRD defines the full UI overhaul for the FX Route Optimizer case study application.

The goal is to transform the app from a basic route calculator into a polished, professional, deployment-ready internal dashboard for a trading or operations team.

The redesigned app should clearly communicate:

- The best FX route
- The top 3 alternatives
- Why each route ranked where it did
- How much better or worse each route is compared to direct routing
- Which providers are healthy or unavailable
- How fees and exchange rates affect the final delivered amount
- How the best route changes across different trade sizes
- Whether the app remains useful when providers are unavailable

The final product should feel like a practical internal fintech/trading operations tool, not a simple assignment demo.

---

## 2. Product Context

A user enters:

- Source currency
- Target currency
- Amount

The app evaluates available liquidity providers and returns the top 3 routes ranked by final amount delivered to the recipient.

Routes can include up to 3 legs. Each leg is executed by one provider. Providers may include fiat brokers and stablecoin venues.

The app must account for:

- Provider-specific exchange rates
- Provider-specific percentage fees
- Provider-specific flat fees
- Direct and multi-leg paths
- Static and live rate providers
- Provider outages or malformed API responses
- Direct route benchmarking
- Operational complexity of routes

---

## 3. Product Vision

Build a professional internal dashboard for pre-trade route review.

The user should be able to quickly answer:

```text
What is the best route?
Why is it the best?
How much will the recipient receive?
What is the all-in effective rate?
How does it compare to the best direct route?
Which providers are involved?
Are any providers unavailable?
Can I audit the calculation?
What happens if a provider goes down?
How does the best route change for larger or smaller amounts?
```

The dashboard should prioritize clarity, reliability, and decision support.

---

## 4. Target Users

## 4.1 Primary User

An operations or trading team member reviewing possible FX execution routes before executing a transaction.

## 4.2 Secondary User

A technical reviewer evaluating the assignment for:

- Product thinking
- UI quality
- Engineering structure
- API integration
- Reliability handling
- Edge-case awareness
- AI-assisted development judgment
- Communication clarity

---

## 5. Design Goals

The UI should feel:

- Professional
- Dense but readable
- Fast to scan
- Dashboard-oriented
- Trading/finance appropriate
- Reliable and transparent
- Easy to demo
- Easy to audit

The UI should not feel:

- Like a landing page
- Like a toy calculator
- Overly animated
- Cluttered
- Overdesigned
- Vague about numbers or warnings

---

## 6. Recommended UI Stack

Use the following stack for the dashboard overhaul:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Recharts
TanStack Table
lucide-react
```

## 6.1 shadcn/ui

Use shadcn/ui as the primary component system.

Recommended components:

```bash
npx shadcn@latest add card button input label select badge table tabs accordion alert skeleton tooltip separator switch checkbox dialog dropdown-menu
```

Use shadcn/ui for:

- Cards
- Buttons
- Inputs
- Selects
- Badges
- Tables
- Tabs
- Accordions
- Alerts
- Skeleton loading states
- Switches
- Checkboxes
- Tooltips
- Dialogs

## 6.2 Recharts

Use Recharts for:

- Amount sensitivity chart
- Final delivered amount comparison
- Effective rate comparison

## 6.3 TanStack Table

Use TanStack Table if route comparison tables require:

- Sorting
- Filtering
- Column visibility
- Advanced table state

For simple tables, shadcn/ui Table is enough.

## 6.4 lucide-react

Use lucide-react icons for:

- Provider status
- Warnings
- Copy button
- Refresh button
- Route icon
- Trend icon
- Dashboard sections

Recommended icons:

```text
Route
TrendingUp
Activity
Copy
RefreshCw
AlertTriangle
CheckCircle
XCircle
Clock
Database
Settings
Info
Shield
```

---

## 7. Global Dashboard Layout

The application should use a dashboard-style layout.

## 7.1 Recommended Page Structure

```text
Header
Main Dashboard Grid
  Left Column
    Order Ticket
    Saved Example Scenarios
    Advanced Controls
    Provider Outage Simulation

  Right/Main Column
    Recommended Route Summary
    Provider Health
    Best Direct Benchmark
    Route Comparison Table
    Top 3 Route Cards
    Amount Sensitivity
    Audit Trail / Diagnostics
    Warnings
```

## 7.2 Layout Sketch

```text
┌──────────────────────────────────────────────────────────────┐
│ FX Route Optimizer                              Demo Mode     │
│ Pre-trade route review across fiat and stablecoin providers  │
├───────────────────────┬──────────────────────────────────────┤
│ Order Ticket          │ Recommended Route                    │
│ Example Scenarios     │ Provider Health                      │
│ Advanced Settings     │ Best Direct Benchmark                │
│ Provider Outage       │ Route Comparison Table               │
├───────────────────────┴──────────────────────────────────────┤
│ Top 3 Route Cards                                             │
├───────────────────────────────────────────────────────────────┤
│ Amount Sensitivity                                            │
├───────────────────────────────────────────────────────────────┤
│ Audit Trail / Diagnostics / Warnings                          │
└───────────────────────────────────────────────────────────────┘
```

## 7.3 Responsive Behavior

Desktop:

- Two-column dashboard layout
- Left sidebar controls
- Main content on the right

Tablet:

- Controls stack above results
- Cards use 2-column grid where possible

Mobile:

- Single-column layout
- Route cards collapse cleanly
- Tables should horizontally scroll if needed

---

## 8. Visual Style

## 8.1 Theme

Recommended style:

```text
Dark dashboard theme
Slate or zinc background
Card-based layout
Subtle borders
Clean spacing
Compact financial data presentation
Monospace numbers
Status badges
Minimal color
```

## 8.2 Color Usage

Use color only for meaning:

```text
Green: best route, online, positive improvement
Yellow/amber: warnings, medium complexity
Red: failed provider, timeout, invalid state
Blue/slate: neutral information
Purple/indigo: stablecoin rail or optional metadata
```

## 8.3 Typography

Use:

- Clear section headers
- Medium-weight labels
- Monospace for amounts, rates, and calculations
- Smaller muted text for explanations and metadata

Example:

```text
Final Delivered
192,430.22 JPY

Effective Rate
192.43 JPY / GBP
```

## 8.4 Number Formatting

All amounts should be formatted consistently.

Rules:

- Currency amounts: 2 to 4 decimals depending on currency
- Rates: 4 to 6 decimals
- Percentages: 2 decimals
- Large numbers: comma separators

Examples:

```text
192,430.22 JPY
192.4302 JPY / GBP
+1,420.10 JPY
+0.74%
```

---

## 9. Header Requirements

## 9.1 Header Content

The top header should include:

- App name
- Short subtitle
- Demo mode badge
- Last rate refresh timestamp
- Optional GitHub/deployment link area

Example:

```text
FX Route Optimizer
Pre-trade route review across fiat brokers and stablecoin venues

Demo Mode
Rates updated: 2:41:08 PM
```

## 9.2 Header Acceptance Criteria

```text
[ ] App title is clearly visible
[ ] Subtitle explains the purpose of the tool
[ ] Demo mode or environment badge is visible
[ ] Last rate refresh appears after calculation
[ ] Header remains clean and not overcrowded
```

---

## 10. Order Ticket

## 10.1 Overview

The Order Ticket is the main input form.

It should feel like a trading/order entry panel.

## 10.2 Required Fields

The form must include:

- Source currency
- Target currency
- Amount
- Submit button

## 10.3 Optional Enhancements

Include:

- Currency dropdowns where possible
- Uppercase normalization
- Swap source/target button
- Clear form button
- Inline validation

## 10.4 Validation Rules

The form must validate:

```text
[ ] Source currency is required
[ ] Target currency is required
[ ] Source and target cannot be the same
[ ] Amount is required
[ ] Amount must be numeric
[ ] Amount must be greater than 0
[ ] Currency codes are normalized to uppercase
```

## 10.5 UI Example

```text
Order Ticket

Source Currency
[ GBP ]

Target Currency
[ JPY ]

Amount
[ 1000 ]

[Find Best Routes]
```

## 10.6 Acceptance Criteria

```text
[ ] User can enter source, target, and amount
[ ] Invalid inputs show clear errors
[ ] Submit button triggers route calculation
[ ] Loading state appears during calculation
[ ] Form values update when saved scenarios are clicked
```

---

## 11. Saved Example Scenarios

## 11.1 Overview

Saved scenarios help reviewers quickly test the app.

## 11.2 Required Scenarios

Include at least five:

```text
GBP → JPY, 1,000
USD → CAD, 10,000
CAD → AUD, 500
EUR → USDC, 5,000
JPY → USD, 100,000
```

Optional:

```text
GBP → CAD, 2,500
EUR → JPY, 25,000
AUD → USD, 1,000
```

## 11.3 Behavior

Clicking a scenario should:

```text
[ ] Fill source currency
[ ] Fill target currency
[ ] Fill amount
[ ] Trigger calculation automatically, if practical
```

## 11.4 UI Placement

Place near the Order Ticket.

Section title:

```text
Try an example
```

## 11.5 Acceptance Criteria

```text
[ ] At least five examples appear
[ ] Examples are easy to click
[ ] Clicking fills the form correctly
[ ] Examples help demonstrate direct, multi-leg, fiat, and stablecoin routes
```

---

## 12. Advanced Settings Panel

## 12.1 Overview

Advanced Settings should keep the main interface clean while allowing deeper testing.

Use an Accordion or collapsible Card.

## 12.2 Controls

Include:

```text
Rail Filter:
- All routes
- Fiat only
- Stablecoin allowed
- Stablecoin only

Max Legs:
- 1
- 2
- 3

Complexity Filter:
- All
- Low only
- Low + Medium
- High allowed

API Timeout:
- Display configured timeout
```

## 12.3 Behavior

Filters should affect route results.

Examples:

```text
Fiat only: excludes stablecoin venues and stablecoin currencies
Max legs = 1: returns direct routes only
Low complexity only: hides medium/high complexity routes
```

## 12.4 Acceptance Criteria

```text
[ ] Advanced settings are hidden/collapsed by default
[ ] Rail filter works
[ ] Max legs setting works
[ ] Complexity filter works if implemented
[ ] UI remains understandable even if settings are not used
```

---

## 13. Provider Outage Simulation

## 13.1 Overview

Provider Outage Simulation allows users to manually disable providers and verify fallback behavior.

## 13.2 Providers

Include toggles or checkboxes for:

```text
AlphaFX
BetaBank
DeltaMarkets
GammaCrypto
EpsilonChain
ZetaSwap
```

## 13.3 Behavior

When a provider is disabled:

```text
[ ] The provider is excluded from route generation
[ ] The provider appears as Simulated Outage in Provider Health
[ ] A warning appears
[ ] Routes recalculate
[ ] Previous best route may change
```

## 13.4 UI Example

```text
Simulate Provider Outage

[ ] AlphaFX
[ ] BetaBank
[ ] DeltaMarkets
[ ] GammaCrypto
[ ] EpsilonChain
[ ] ZetaSwap
```

## 13.5 Acceptance Criteria

```text
[ ] All six providers can be toggled
[ ] Disabled providers are excluded
[ ] Provider Health updates correctly
[ ] Warnings are shown
[ ] App handles all providers disabled
[ ] Routes recalculate correctly
```

---

## 14. Recommended Route Summary

## 14.1 Overview

The top of the results area should show a focused summary of the best route.

This is the most important dashboard card.

## 14.2 Content

Show:

- Recommended route path
- Final delivered amount
- Effective rate
- Improvement vs direct
- Complexity label
- Provider count
- Leg count
- Stablecoin rail indicator, if applicable

## 14.3 UI Example

```text
Recommended Route

GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY

Final Delivered
192,430.22 JPY

Effective Rate
192.43 JPY / GBP

Improvement vs Direct
+1,420.10 JPY (+0.74%)

Complexity
High
```

## 14.4 Acceptance Criteria

```text
[ ] Recommended route appears before detailed route cards
[ ] Best route is visually obvious
[ ] Final amount is prominent
[ ] Effective rate is shown
[ ] Direct comparison is shown if available
[ ] Complexity is shown
```

---

## 15. Provider Health Panel

## 15.1 Overview

Provider Health shows the current state of each provider.

## 15.2 Status Types

Support:

```text
Online
Static Loaded
Timeout
Failed
Malformed Response
Skipped
Simulated Outage
Missing Pair
```

## 15.3 Content

For each provider, show:

- Provider name
- Provider type
- Status
- Last fetched or attempted timestamp
- Optional message

## 15.4 UI Example

```text
Provider Health

AlphaFX        Online              Last fetched 2:41 PM
BetaBank       Timeout             Excluded from results
DeltaMarkets   Online              Last fetched 2:41 PM
GammaCrypto    Static Loaded       providers.json
EpsilonChain   Static Loaded       providers.json
ZetaSwap       Simulated Outage    Manually disabled
```

## 15.5 Acceptance Criteria

```text
[ ] All providers are listed
[ ] Status is easy to scan
[ ] Failed providers do not break the app
[ ] Simulated outages are clearly marked
[ ] Provider messages are visible when useful
```

---

## 16. Best Direct Benchmark Card

## 16.1 Overview

Show the best direct route separately.

This gives the user a clear baseline.

## 16.2 Content

Show:

- Best direct route path
- Provider
- Final delivered amount
- Effective rate
- Fees
- If no direct route exists, show no direct route message

## 16.3 UI Example

```text
Best Direct Route

GBP →[AlphaFX]→ JPY

Final Delivered
191,010.12 JPY

Effective Rate
191.01 JPY / GBP
```

## 16.4 Acceptance Criteria

```text
[ ] Best direct route is identified if available
[ ] No direct route state is handled
[ ] Top routes compare against this benchmark
[ ] Direct route is visually distinct from recommended route
```

---

## 17. Route Comparison Table

## 17.1 Overview

Before detailed route cards, show a concise comparison table for the top 3 routes.

## 17.2 Columns

Required columns:

```text
Rank
Path
Final Delivered
Effective Rate
Difference vs Direct
Difference vs Direct %
Complexity
Legs
Providers
```

## 17.3 Example

| Rank | Path | Final Delivered | Effective Rate | Vs Direct | Complexity |
|---:|---|---:|---:|---:|---|
| 1 | GBP → USD → USDT → JPY | 192,430.22 JPY | 192.43 | +0.74% | High |
| 2 | GBP → USDC → JPY | 191,900.14 JPY | 191.90 | +0.46% | Medium |
| 3 | GBP → JPY | 191,010.12 JPY | 191.01 | Direct | Low |

## 17.4 Acceptance Criteria

```text
[ ] Top 3 routes appear in comparison table
[ ] Table is readable
[ ] Amounts and rates are formatted consistently
[ ] User can quickly compare routes before opening detailed cards
```

---

## 18. Top 3 Route Cards

## 18.1 Overview

Each route card should provide detailed information for one of the top 3 routes.

## 18.2 Required Content

Each route card must show:

- Rank
- Route path with provider labels
- Final delivered amount
- Effective rate
- Difference vs direct
- Difference vs direct percentage
- Complexity label
- Complexity reasons
- Why This Route Won explanation
- Copy Route Summary button
- Per-leg breakdown
- Calculation audit trail

## 18.3 Route Labels

Use labels:

```text
#1 Recommended Route
#2 Best Fallback
#3 Backup Option
```

## 18.4 Route Path Example

```text
GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY
```

## 18.5 Acceptance Criteria

```text
[ ] Exactly top 3 routes are shown when available
[ ] Each route card is scannable
[ ] Important metrics are visible without expanding details
[ ] Detailed breakdown is available
[ ] Copy button works
```

---

## 19. Effective Rate Display

## 19.1 Formula

```text
effectiveRate = finalDeliveredAmount / startingAmount
```

## 19.2 Display

Example:

```text
Effective Rate
192.43 JPY / GBP
```

## 19.3 Acceptance Criteria

```text
[ ] Effective rate appears on summary card
[ ] Effective rate appears on each route card
[ ] Effective rate appears in comparison table
[ ] Effective rate updates when amount/source/target changes
```

---

## 20. Route Complexity Label

## 20.1 Complexity Levels

Support:

```text
Low Complexity
Medium Complexity
High Complexity
```

## 20.2 Complexity Rules

Low:

```text
1 leg
1 provider
No stablecoin rail
```

Medium:

```text
2 legs
or 2 providers
or includes one stablecoin leg
```

High:

```text
3 legs
or 3 providers
or stablecoin rail plus multiple providers
```

## 20.3 Data Type

```ts
type RouteComplexity = {
  level: "Low" | "Medium" | "High";
  reasons: string[];
};
```

## 20.4 Acceptance Criteria

```text
[ ] Every route has a complexity label
[ ] Complexity is calculated from route data
[ ] At least one reason is shown
[ ] Complexity updates when routes change
```

---

## 21. Why This Route Won Explanation

## 21.1 Overview

Each route card should include a plain-English explanation.

## 21.2 Explanation Inputs

Use:

- Route rank
- Direct comparison
- Effective rate
- Number of legs
- Stablecoin usage
- Complexity
- Flat fee impact
- Whether route is direct or multi-leg

## 21.3 Example

```text
This route ranks #1 because the improved multi-leg conversion outweighs the added fees. At this transfer size, the flat fees have a smaller impact, allowing the route to deliver more than the best direct option.
```

## 21.4 Acceptance Criteria

```text
[ ] Explanation appears on every route card
[ ] Explanation is generated from route data
[ ] Explanation is short
[ ] Explanation avoids unsupported claims
```

---

## 22. Copy Route Summary

## 22.1 Overview

Each route card should have a Copy Summary button.

## 22.2 Copied Content

Include:

- Route rank
- Path
- Final delivered amount
- Effective rate
- Difference vs direct
- Complexity
- Explanation

## 22.3 Example

```text
Route #1

Path:
GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY

Final delivered:
192,430.22 JPY

Effective rate:
192.43 JPY / GBP

Difference vs direct:
+1,420.10 JPY (+0.74%)

Complexity:
High

Reason:
This route ranks #1 because the improved multi-leg conversion outweighs the added fees.
```

## 22.4 Acceptance Criteria

```text
[ ] Copy button appears on every route card
[ ] Clipboard output is clean
[ ] UI confirms successful copy
[ ] Clipboard failure is handled
```

---

## 23. Per-Leg Breakdown

## 23.1 Overview

Every route must show a per-leg breakdown.

## 23.2 Required Columns

```text
Leg
Provider
From
To
Input Amount
Fee
Amount After Fee
Rate
Output Amount
```

## 23.3 Example

| Leg | Provider | From | To | Input | Fee | After Fee | Rate | Output |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | BetaBank | GBP | USD | 1,000.00 | 25.80 | 974.20 | 1.2700 | 1,237.23 |

## 23.4 Acceptance Criteria

```text
[ ] Every route includes per-leg breakdown
[ ] Fee math is visible
[ ] Output from one leg matches input to next leg
[ ] Table is readable on desktop and mobile
```

---

## 24. Calculation Audit Trail

## 24.1 Overview

The audit trail makes the math transparent.

This is one of the most professional finance-oriented UI upgrades.

## 24.2 Content

For each leg, show the calculation:

```text
Leg 1: GBP → USD via BetaBank

Input:
1,000.00 GBP

Fee:
1,000.00 × 0.0008 + 25 = 25.80 GBP

Amount after fee:
974.20 GBP

Rate:
1.2700

Output:
1,237.23 USD
```

## 24.3 UI Placement

Use an Accordion under each route card:

```text
View Calculation Audit Trail
```

## 24.4 Acceptance Criteria

```text
[ ] Audit trail is available for every route
[ ] Fee formula is visible
[ ] Inputs and outputs are formatted clearly
[ ] Audit trail matches per-leg table values
```

---

## 25. Amount Sensitivity Section

## 25.1 Overview

Show how the optimal route changes as amount scales.

## 25.2 Amounts

Use default amounts based on the entered amount or fixed examples:

```text
100
1,000
10,000
100,000
```

Or dynamic scale:

```text
0.1x
1x
10x
100x
```

## 25.3 Display

Use:

- Table
- Optional Recharts line chart or bar chart

## 25.4 Required Columns

```text
Input Amount
Best Route
Final Delivered
Effective Rate
Difference vs Direct
Complexity
```

## 25.5 Acceptance Criteria

```text
[ ] Sensitivity section appears after route results
[ ] Shows multiple amounts
[ ] Shows best route per amount
[ ] Demonstrates flat fee vs percent fee effect
[ ] Chart/table is readable
```

---

## 26. Data Freshness

## 26.1 Overview

Show when live rates were fetched and whether cached data was used.

## 26.2 Required Data

Show:

```text
Rates fetched at
Cache status
Live providers used
Static providers loaded
Failed providers
```

## 26.3 Example

```text
Rates fetched at: 2:41:08 PM
Cache: live refresh
Live providers used: 2/3
Static providers loaded: 3/3
```

## 26.4 Acceptance Criteria

```text
[ ] Rate timestamp appears after calculation
[ ] Provider Health includes timestamp where possible
[ ] Cached/live status is clear
[ ] Failed fetch attempts show attempted timestamp
```

---

## 27. Warnings and Diagnostics

## 27.1 Overview

Warnings should be visible but not overwhelming.

## 27.2 Warning Types

Show warnings for:

```text
Provider timeout
Provider failed
Malformed response
Provider manually disabled
No direct route available
No valid routes found
All providers disabled
Partial provider coverage
```

## 27.3 UI

Use shadcn Alert component.

Example:

```text
Some providers were unavailable. Results were calculated using the remaining providers.
```

## 27.4 Acceptance Criteria

```text
[ ] Warnings are visible
[ ] Warnings are specific
[ ] Warnings do not block valid results
[ ] No-route errors are clear and helpful
```

---

## 28. Loading States

## 28.1 Overview

The app should feel responsive while fetching rates and calculating routes.

## 28.2 Required Loading States

Show progress messages:

```text
Fetching provider rates...
Normalizing provider quotes...
Building route graph...
Calculating top routes...
```

Use skeleton cards for:

- Recommended route
- Provider health
- Route cards

## 28.3 Acceptance Criteria

```text
[ ] Loading state appears immediately after submit
[ ] Skeletons replace result cards while loading
[ ] User understands what the app is doing
[ ] Submit button is disabled while loading
```

---

## 29. Empty States

## 29.1 First Load Empty State

Before calculation:

```text
Start by entering an FX order or choose one of the example scenarios.
```

## 29.2 No Routes Found

```text
No valid routes found for this currency pair using the currently enabled providers.

Try:
- Enabling more providers
- Changing the target currency
- Increasing the amount if flat fees are too high
```

## 29.3 All Providers Disabled

```text
All providers are disabled. Enable at least one provider to calculate routes.
```

## 29.4 Acceptance Criteria

```text
[ ] First-load state is friendly
[ ] No-route state is clear
[ ] All-disabled state is handled
[ ] Empty states suggest next action
```

---

## 30. Recent Searches

## 30.1 Overview

Store recent route searches in local storage.

## 30.2 Content

For each recent search, store:

```text
Source
Target
Amount
Timestamp
```

## 30.3 Behavior

Clicking a recent search should refill the form and optionally rerun the calculation.

## 30.4 Acceptance Criteria

```text
[ ] Recent searches save after successful calculation
[ ] Recent searches appear near examples or sidebar
[ ] Clicking a recent search restores values
[ ] User can clear recent searches
```

---

## 31. Route Filters

## 31.1 Overview

Filters let users narrow results based on operational constraints.

## 31.2 Filters

Support:

```text
All routes
Direct only
Fiat only
Stablecoin allowed
Stablecoin only
Low complexity only
```

## 31.3 Acceptance Criteria

```text
[ ] Filters are easy to access
[ ] Filters update route results
[ ] Filtered-out state is clear
[ ] Filters interact correctly with outage toggles
```

---

## 32. Internal Architecture Requirements

## 32.1 Layered Architecture

The app should be organized into layers:

```text
UI components
API route
Service layer
Provider adapters
Routing engine
Utilities
```

## 32.2 Recommended Folder Structure

```text
src/
  app/
    page.tsx
    api/
      routes/
        route.ts

  components/
    dashboard/
      DashboardHeader.tsx
      OrderTicket.tsx
      ExampleScenarios.tsx
      AdvancedSettings.tsx
      ProviderOutageToggle.tsx
      RecommendedRouteCard.tsx
      ProviderHealthPanel.tsx
      DirectBenchmarkCard.tsx
      RouteComparisonTable.tsx
      RouteCard.tsx
      RouteLegTable.tsx
      CalculationAuditTrail.tsx
      AmountSensitivity.tsx
      WarningsPanel.tsx
      EmptyState.tsx

  lib/
    providers/
      adapters/
        alphaFxAdapter.ts
        betaBankAdapter.ts
        deltaMarketsAdapter.ts
        staticProviderAdapter.ts
      providerTypes.ts

    routing/
      types.ts
      buildEdges.ts
      generateRoutes.ts
      simulateRoute.ts
      findTopRoutes.ts
      calculateEffectiveRate.ts
      calculateComplexity.ts
      explainRoute.ts
      formatRouteSummary.ts

    validation/
      routeRequestSchema.ts

    utils/
      fetchWithTimeout.ts
      cache.ts
      formatCurrency.ts
      formatRate.ts
      formatPercent.ts
      formatRoutePath.ts
```

## 32.3 Acceptance Criteria

```text
[ ] UI components do not contain core route math
[ ] Provider-specific API logic is isolated
[ ] Routing engine works independently from UI
[ ] Formatting utilities are centralized
[ ] Validation is handled before route calculation
```

---

## 33. Provider Adapter Pattern

## 33.1 Overview

Each provider should expose a consistent adapter interface.

## 33.2 Adapter Type

```ts
type ProviderAdapter = {
  name: string;
  fetchEdges: (options?: FetchOptions) => Promise<{
    edges: Edge[];
    health: ProviderHealth;
  }>;
};
```

## 33.3 Benefits

This makes it easy to:

- Add new providers
- Test provider failures
- Normalize API responses
- Keep routing logic provider-agnostic

## 33.4 Acceptance Criteria

```text
[ ] Each live provider has an adapter
[ ] Static providers use the same normalized output
[ ] All adapters return edges and health
[ ] Failed adapters return health without crashing the app
```

---

## 34. API Validation

## 34.1 Overview

Use structured validation for route requests.

Recommended library:

```text
Zod
```

## 34.2 Request Schema

```ts
const RouteRequestSchema = z.object({
  source: z.string().min(3).max(5),
  target: z.string().min(3).max(5),
  amount: z.number().positive(),
  disabledProviders: z.array(z.string()).optional(),
  maxLegs: z.number().min(1).max(3).optional(),
  railFilter: z.enum(["all", "fiat_only", "stablecoin_allowed", "stablecoin_only"]).optional()
});
```

## 34.3 Acceptance Criteria

```text
[ ] Invalid requests return clear errors
[ ] Amount must be positive
[ ] Source and target are normalized
[ ] Disabled providers are validated
[ ] API does not crash on malformed body
```

---

## 35. Caching, Timeout, and Retry

## 35.1 Timeout

All live provider requests should use timeout handling.

Recommended default:

```text
5 seconds
```

## 35.2 Retry

Retry failed live provider requests once.

```text
Attempt 1
Retry once
If still failing, mark provider unavailable and continue
```

## 35.3 Cache

Cache live rates briefly.

Recommended:

```text
5 to 15 minutes
```

## 35.4 UI Impact

Show:

```text
Live refresh
Cached result
Last fetched timestamp
```

## 35.5 Acceptance Criteria

```text
[ ] Live API requests use timeout
[ ] Failed providers do not crash the app
[ ] Retry is limited
[ ] Cache status is visible
[ ] Cache does not hide provider failures incorrectly
```

---

## 36. Environment Configuration

## 36.1 Required Files

Add:

```text
.env.example
```

## 36.2 Example Values

```env
RATE_API_TIMEOUT_MS=5000
RATE_CACHE_TTL_SECONDS=600
MAX_ROUTE_LEGS=3
```

## 36.3 Acceptance Criteria

```text
[ ] .env.example exists
[ ] README explains environment variables
[ ] App has safe defaults if env vars are missing
```

---

## 37. Testing Requirements

## 37.1 UI Manual Tests

Test:

```text
[ ] User can submit valid order
[ ] Invalid input shows errors
[ ] Saved examples work
[ ] Provider toggles work
[ ] Route cards display correctly
[ ] Copy summary works
[ ] Audit trail matches route math
[ ] Filters update results
[ ] No-route state appears
[ ] Loading state appears
```

## 37.2 Unit Tests

Test:

```text
[ ] fee calculation
[ ] route simulation
[ ] route ranking
[ ] effective rate calculation
[ ] complexity calculation
[ ] route explanation generation
[ ] disabled provider filtering
[ ] provider edge normalization
[ ] direct route benchmark
[ ] no valid route case
```

## 37.3 Build Checks

Before submission, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

---

## 38. README Updates

The README should include:

```text
Live demo
GitHub repository
Overview
Tech stack
Features
Dashboard UI overview
Routing model
Fee calculation
Provider handling
Reliability and failure handling
Extra features
AI usage
One thing AI got wrong
Setup
Environment variables
Run tests
Assumptions
What I would improve with more time
```

## 38.1 Extra Features Section

Recommended text:

```text
Beyond the core assignment requirements, I redesigned the app as a trading operations dashboard. It includes a recommended route summary, route comparison table, provider health panel, outage simulation, effective rate display, route complexity labels, plain-English route explanations, copyable route summaries, saved examples, amount sensitivity analysis, and calculation audit trails.
```

---

## 39. Final Acceptance Criteria

The UI overhaul is complete when:

```text
[ ] App feels like a professional dashboard
[ ] User can enter and submit an FX order
[ ] Recommended route is immediately obvious
[ ] Top 3 routes are visible and easy to compare
[ ] Effective rate is shown
[ ] Difference vs direct is shown
[ ] Direct benchmark card exists
[ ] Provider Health panel exists
[ ] Provider outage simulation works
[ ] Saved examples work
[ ] Route explanations appear
[ ] Route complexity labels appear
[ ] Copy summary works
[ ] Per-leg breakdown appears
[ ] Calculation audit trail appears
[ ] Amount sensitivity section appears
[ ] Warnings and empty states are clear
[ ] Loading states are polished
[ ] Recent searches work if implemented
[ ] Route filters work if implemented
[ ] Code is modular and clean
[ ] App builds successfully
[ ] README documents the dashboard features
```

---

## 40. Implementation Priority

If time is limited, implement in this order:

```text
1. Dashboard layout with shadcn/ui
2. Order Ticket redesign
3. Recommended Route Summary card
4. Provider Health Panel
5. Route Comparison Table
6. Top 3 Route Cards redesign
7. Effective Rate display
8. Direct Benchmark card
9. Route Complexity labels
10. Why This Route Won explanations
11. Copy Route Summary button
12. Provider Outage Simulation
13. Saved Example Scenarios
14. Calculation Audit Trail
15. Amount Sensitivity table/chart
16. Advanced Settings and Route Filters
17. Data Freshness timestamps
18. Loading and empty states
19. Recent Searches
20. README polish and deployment checks
```

---

## 41. Final Definition of Done

The UI overhaul is done when the app can be shown to a reviewer and they can understand within 30 seconds:

```text
- What order was entered
- Which route is recommended
- How much the recipient receives
- What effective rate was achieved
- How it compares to direct routing
- Which providers were used
- Which providers were unavailable
- Why the route ranked highly
- How the calculation was performed
- Whether the app still works during provider outages
```

The final app should feel like a polished internal trading technology dashboard that is ready to deploy, demo, and discuss in a technical interview.
