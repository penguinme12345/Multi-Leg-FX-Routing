const STABLECOIN_CODES = new Set(["USDC", "USDT", "DAI"]);

export function isLiveRateCurrency(code: string, base: string) {
  const normalized = code.toUpperCase();

  return (
    normalized !== base &&
    /^[A-Z]{3}$/.test(normalized) &&
    !STABLECOIN_CODES.has(normalized)
  );
}
