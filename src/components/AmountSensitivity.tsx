"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
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
      <div className="chart-wrap" aria-label="Amount sensitivity chart">
        <ResponsiveContainer height={240} width="100%">
          <LineChart data={points.filter((point) => point.finalAmount !== null)}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="amount"
              stroke="#9ca3af"
              tickFormatter={(value) => `${Number(value).toLocaleString("en-US")}`}
            />
            <YAxis
              stroke="#9ca3af"
              tickFormatter={(value) => `${Number(value).toLocaleString("en-US")}`}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                color: "#f4f4f5"
              }}
              formatter={(value) => [formatAmount(Number(value), target), "Final delivered"]}
              labelFormatter={(value) => `Input ${formatAmount(Number(value), source)}`}
            />
            <Line
              dataKey="finalAmount"
              dot={{ r: 4 }}
              stroke="#14b8a6"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="table-wrap compact-table">
        <table className="leg-table sensitivity-table">
          <thead>
            <tr>
              <th className="numeric">Input</th>
              <th>Best route</th>
              <th>Providers</th>
              <th className="numeric">Final delivered</th>
              <th className="numeric">Effective rate</th>
              <th className="numeric">Vs direct</th>
              <th>Complexity</th>
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
                <td className="numeric">
                  {point.effectiveRate === null ? "N/A" : `${point.effectiveRate.toFixed(4)} ${target} / ${source}`}
                </td>
                <td className="numeric">{formatDifference(point.differenceVsDirect, target)}</td>
                <td>{point.complexity?.level ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
