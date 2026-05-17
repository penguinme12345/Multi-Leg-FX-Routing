"use client";

const providerNames = ["AlphaFX", "BetaBank", "DeltaMarkets", "GammaCrypto", "EpsilonChain", "ZetaSwap"];

type ProviderOutageToggleProps = {
  disabledProviders: string[];
  loading: boolean;
  onChange: (disabledProviders: string[]) => void;
};

export function ProviderOutageToggle({
  disabledProviders,
  loading,
  onChange
}: ProviderOutageToggleProps) {
  const disabledSet = new Set(disabledProviders);

  function toggleProvider(provider: string) {
    if (disabledSet.has(provider)) {
      onChange(disabledProviders.filter((disabledProvider) => disabledProvider !== provider));
      return;
    }

    onChange([...disabledProviders, provider]);
  }

  return (
    <section className="form-subsection">
      <h3>Simulate provider outage</h3>
      <div className="toggle-list" aria-label="Provider outage simulation">
        {providerNames.map((provider) => (
          <label className="toggle-row" key={provider}>
            <input
              checked={disabledSet.has(provider)}
              disabled={loading}
              type="checkbox"
              onChange={() => toggleProvider(provider)}
            />
            <span>{provider}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
