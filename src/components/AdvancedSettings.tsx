"use client";

import type { ComplexityFilter, RailFilter } from "@/lib/routing/types";

type AdvancedSettingsProps = {
  maxLegs: number;
  railFilter: RailFilter;
  complexityFilter: ComplexityFilter;
  loading: boolean;
  onChange: (settings: {
    maxLegs: number;
    railFilter: RailFilter;
    complexityFilter: ComplexityFilter;
  }) => void;
};

export function AdvancedSettings({
  maxLegs,
  railFilter,
  complexityFilter,
  loading,
  onChange
}: AdvancedSettingsProps) {
  return (
      <div className="settings-grid">
        <div className="field">
          <label htmlFor="rail-filter">Rail filter</label>
          <select
            className="input select-input"
            disabled={loading}
            id="rail-filter"
            value={railFilter}
            onChange={(event) =>
              onChange({
                maxLegs,
                complexityFilter,
                railFilter: event.target.value as RailFilter
              })
            }
          >
            <option value="all">All routes</option>
            <option value="fiat_only">Fiat only</option>
            <option value="stablecoin_allowed">Stablecoin allowed</option>
            <option value="stablecoin_only">Stablecoin only</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="max-legs">Max legs</label>
          <select
            className="input select-input"
            disabled={loading}
            id="max-legs"
            value={String(maxLegs)}
            onChange={(event) =>
              onChange({
                railFilter,
                complexityFilter,
                maxLegs: Number(event.target.value)
              })
            }
          >
            <option value="1">1 leg</option>
            <option value="2">2 legs</option>
            <option value="3">3 legs</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="complexity-filter">Complexity filter</label>
          <select
            className="input select-input"
            disabled={loading}
            id="complexity-filter"
            value={complexityFilter}
            onChange={(event) =>
              onChange({
                maxLegs,
                railFilter,
                complexityFilter: event.target.value as ComplexityFilter
              })
            }
          >
            <option value="all">All complexity</option>
            <option value="low">Low only</option>
            <option value="low_medium">Low + Medium</option>
            <option value="high_allowed">High allowed</option>
          </select>
        </div>
        <div className="settings-note">API timeout: 3.5s per live request. Rate cache: 10 minutes.</div>
      </div>
  );
}
