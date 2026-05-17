export function formatAmount(value: number, currency?: string) {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}${currency ? ` ${currency}` : ""}`;
}

export function formatRate(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8
  }).format(value);
}

export function formatPercent(value: number | null) {
  if (value === null) {
    return "No direct route available";
  }

  const sign = value >= 0 ? "+" : "";

  return `${sign}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}% vs direct`;
}

export function formatDifference(value: number | null, currency: string) {
  if (value === null) {
    return "No direct route available";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatAmount(value, currency)} vs direct`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString();
}
