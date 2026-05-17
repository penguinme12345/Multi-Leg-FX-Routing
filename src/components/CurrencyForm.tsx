type CurrencyFormProps = {
  source: string;
  target: string;
  amount: string;
  loading: boolean;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
};

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
          <select
            id="source"
            className="input select-input"
            value={source}
            onChange={(event) => onSourceChange(event.target.value)}
          >
            {commonCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="target">Target currency</label>
          <select
            id="target"
            className="input select-input"
            value={target}
            onChange={(event) => onTargetChange(event.target.value)}
          >
            {commonCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
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
    </aside>
  );
}
