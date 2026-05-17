"use client";

export type ExampleScenario = {
  source: string;
  target: string;
  amount: string;
  label: string;
};

type ExampleScenariosProps = {
  loading: boolean;
  onSelect: (scenario: ExampleScenario) => void;
};

export const exampleScenarios: ExampleScenario[] = [
  { source: "GBP", target: "JPY", amount: "1000", label: "GBP -> JPY" },
  { source: "USD", target: "CAD", amount: "10000", label: "USD -> CAD" },
  { source: "CAD", target: "AUD", amount: "500", label: "CAD -> AUD" },
  { source: "EUR", target: "USDC", amount: "5000", label: "EUR -> USDC" },
  { source: "JPY", target: "USD", amount: "100000", label: "JPY -> USD" }
];

export function ExampleScenarios({ loading, onSelect }: ExampleScenariosProps) {
  return (
    <section className="form-subsection">
      <h3>Try an example</h3>
      <div className="scenario-grid" aria-label="Saved example scenarios">
        {exampleScenarios.map((scenario) => (
          <button
            className="scenario-button"
            disabled={loading}
            key={`${scenario.source}-${scenario.target}-${scenario.amount}`}
            onClick={() => onSelect(scenario)}
            type="button"
          >
            <span>{scenario.label}</span>
            <strong>{Number(scenario.amount).toLocaleString("en-US")}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
