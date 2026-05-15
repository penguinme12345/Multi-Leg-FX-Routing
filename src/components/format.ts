export function formatAmount(value: number, currency?: string) {
  const maximumFractionDigits = currency === "JPY" ? 2 : 4;

  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits
  }).format(value)}${currency ? ` ${currency}` : ""}`;
}

export function formatRate(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8
  }).format(value);
}

export function formatDifference(value: number | null, currency: string) {
  if (value === null) {
    return "No direct route available";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatAmount(value, currency)} vs direct`;
}
