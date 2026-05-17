import { formatAmount, formatRate } from "@/components/format";
import type { RouteLegResult } from "@/lib/routing/types";

type CalculationAuditTrailProps = {
  legs: RouteLegResult[];
};

export function CalculationAuditTrail({ legs }: CalculationAuditTrailProps) {
  return (
    <details className="audit-trail">
      <summary>View calculation audit trail</summary>
      <div className="audit-stack">
        {legs.map((leg, index) => {
          return (
            <div className="audit-leg" key={`${leg.provider}-${leg.from}-${leg.to}-${index}`}>
              <h4>Leg {index + 1}: {leg.from} to {leg.to} via {leg.provider}</h4>
              <p>Input: <strong>{formatAmount(leg.inputAmount, leg.from)}</strong></p>
              <p>
                Fee: <strong>{formatAmount(leg.inputAmount, leg.from)} x {leg.feePercent.toFixed(4)} + {formatAmount(leg.feeFlat, leg.from)} = {formatAmount(leg.fee, leg.from)}</strong>
              </p>
              <p>Amount after fee: <strong>{formatAmount(leg.amountAfterFee, leg.from)}</strong></p>
              <p>Rate: <strong>{formatRate(leg.rate)}</strong></p>
              <p>Output: <strong>{formatAmount(leg.outputAmount, leg.to)}</strong></p>
            </div>
          );
        })}
      </div>
    </details>
  );
}
