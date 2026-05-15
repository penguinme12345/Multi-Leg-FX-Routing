import { formatAmount, formatRate } from "@/components/format";
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
            <th>From</th>
            <th>To</th>
            <th className="numeric">Input</th>
            <th className="numeric">Rate</th>
            <th className="numeric">Fee</th>
            <th className="numeric">Output</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, index) => (
            <tr key={`${leg.provider}-${leg.from}-${leg.to}-${index}`}>
              <td>{index + 1}</td>
              <td>{leg.provider}</td>
              <td>{leg.from}</td>
              <td>{leg.to}</td>
              <td className="numeric">{formatAmount(leg.inputAmount, leg.from)}</td>
              <td className="numeric">{formatRate(leg.rate)}</td>
              <td className="numeric">{formatAmount(leg.fee, leg.from)}</td>
              <td className="numeric">{formatAmount(leg.outputAmount, leg.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
