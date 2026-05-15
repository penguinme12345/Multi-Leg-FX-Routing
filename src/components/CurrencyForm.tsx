"use client";

type Example = {
  source: string;
  target: string;
  amount: string;
  label: string;
};

type CurrencyFormProps = {
  source: string;
  target: string;
  amount: string;
  loading: boolean;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  onExample: (example: Example) => void;
};

const examples: Example[] = [
  { source: "GBP", target: "JPY", amount: "1000", label: "GBP to JPY" },
  { source: "USD", target: "CAD", amount: "10000", label: "USD to CAD" },
  { source: "CAD", target: "AUD", amount: "100", label: "CAD to AUD" },
  { source: "EUR", target: "USDC", amount: "5000", label: "EUR to USDC" }
];

const commonCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "USDT", "USDC"];

export function CurrencyForm({
  source,
  target,
  amount,
  loading,
  onSourceChange,
  onTargetChange,
  onAmountChange,
  onSubmit,
  onExample
}: CurrencyFormProps) {
  return (
    <aside className="panel form-panel">
      <h2 className="form-title">Route request</h2>
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="field">
          <label htmlFor="source">Source currency</label>
          <input
            id="source"
            className="input"
            list="currency-list"
            maxLength={6}
            placeholder="GBP"
            value={source}
            onChange={(event) => onSourceChange(event.target.value.toUpperCase())}
          />
        </div>
        <div className="field">
          <label htmlFor="target">Target currency</label>
          <input
            id="target"
            className="input"
            list="currency-list"
            maxLength={6}
            placeholder="JPY"
            value={target}
            onChange={(event) => onTargetChange(event.target.value.toUpperCase())}
          />
        </div>
        <datalist id="currency-list">
          {commonCurrencies.map((currency) => (
            <option key={currency} value={currency} />
          ))}
        </datalist>
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            className="input"
            inputMode="decimal"
            min="0"
            placeholder="1000"
            type="number"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />
        </div>
        <button className="submit-button" disabled={loading} type="submit">
          {loading ? "Calculating" : "Calculate top routes"}
        </button>
      </form>
      <div className="example-grid" aria-label="Example route requests">
        {examples.map((example) => (
          <button
            className="example-button"
            key={example.label}
            onClick={() => onExample(example)}
            type="button"
          >
            {example.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
