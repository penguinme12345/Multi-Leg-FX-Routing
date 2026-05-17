export function calculateEffectiveRate(finalAmount: number, startingAmount: number) {
  if (!Number.isFinite(finalAmount) || !Number.isFinite(startingAmount) || startingAmount <= 0) {
    return 0;
  }

  return finalAmount / startingAmount;
}
