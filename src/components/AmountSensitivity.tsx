import { formatAmount, formatDifference } from "@/components/format";
import type { AmountSensitivityPoint } from "@/lib/routing/types";

type AmountSensitivityProps = {
  source: string;
  target: string;
  points: AmountSensitivityPoint[];
};

export function AmountSensitivity({ source, target, points }: AmountSensitivityProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <section className="panel insight-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow compact">Scenario analysis</p>
          <h2 className="section-title">Amount sensitivity</h2>
        </div>
        <span className="result-context">
          {source} to {target}
        </span>
      </div>
      <div className="table-wrap compact-table">
        <table className="leg-table sensitivity-table">
          <thead>
            <tr>
              <th className="numeric">Input</th>
              <th>Best route</th>
              <th>Providers</th>
              <th className="numeric">Final delivered</th>
              <th className="numeric">Vs direct</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.amount}>
                <td className="numeric">{formatAmount(point.amount, source)}</td>
                <td>{point.path ? point.path.join(" -> ") : point.message}</td>
                <td>{point.providerSequence.length ? point.providerSequence.join(" -> ") : "No route"}</td>
                <td className="numeric">
                  {point.finalAmount === null ? "N/A" : formatAmount(point.finalAmount, target)}
                </td>
                <td className="numeric">{formatDifference(point.differenceVsDirect, target)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
