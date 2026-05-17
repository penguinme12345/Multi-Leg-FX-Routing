"use client";

export type RecentSearch = {
  source: string;
  target: string;
  amount: string;
  timestamp: string;
};

type RecentSearchesProps = {
  searches: RecentSearch[];
  loading: boolean;
  onSelect: (search: RecentSearch) => void;
  onClear: () => void;
};

export function RecentSearches({ searches, loading, onSelect, onClear }: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <section className="form-subsection">
      <div className="section-row">
        <h3>Recent searches</h3>
        <button className="link-button" type="button" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="scenario-grid">
        {searches.map((search) => (
          <button
            className="scenario-button"
            disabled={loading}
            key={`${search.source}-${search.target}-${search.amount}-${search.timestamp}`}
            type="button"
            onClick={() => onSelect(search)}
          >
            <span>{search.source} -&gt; {search.target}</span>
            <strong>{Number(search.amount).toLocaleString("en-US")}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
