import { formatAmount, formatRate, formatRateSource } from "@/components/format";
import type { RouteLegResult } from "@/lib/routing/types";

type RouteLegTableProps = {
  legs: RouteLegResult[];
};

export function RouteLegTable({ legs }: RouteLegTableProps) {
  return (
    <div className="table-wrap">
      <table className="leg-table">
        <thead>
          <tr>
            <th>Leg</th>
            <th>Provider</th>
            <th>Pair</th>
            <th>Source</th>
            <th className="numeric">Input</th>
            <th className="numeric">Fee</th>
            <th className="numeric">Rate</th>
            <th className="numeric">Output</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, index) => (
            <tr key={`${leg.provider}-${leg.from}-${leg.to}-${index}`}>
              <td>{index + 1}</td>
              <td>{leg.provider}</td>
              <td><span className="currency-pair">{leg.from} &rarr; {leg.to}</span></td>
              <td>
                <span
                  className={`source-badge ${leg.rateSource}`}
                  title={
                    leg.rateSource === "configured_static"
                      ? "Configured rates are loaded from providers.json, not a live provider API."
                      : "Rate loaded from a live provider API or memory cache."
                  }
                >
                  {formatRateSource(leg.rateSource)}
                </span>
              </td>
              <td className="numeric">{formatAmount(leg.inputAmount, leg.from)}</td>
              <td className="numeric">{formatAmount(leg.fee, leg.from)}</td>
              <td className="numeric">{formatRate(leg.rate)}</td>
              <td className="numeric">{formatAmount(leg.outputAmount, leg.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
