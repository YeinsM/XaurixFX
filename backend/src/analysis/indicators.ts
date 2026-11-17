function validatePeriod(period: number): void {
  if (!Number.isInteger(period) || period < 1) {
    throw new RangeError('period must be a positive integer');
  }
}

function validatePrices(values: number[]): void {
  if (values.some(value => !Number.isFinite(value))) {
    throw new RangeError('prices must be finite');
  }
}

export function calculateEma(values: number[], period: number): Array<number | null> {
  validatePeriod(period);
  validatePrices(values);

  const result: Array<number | null> = Array(values.length).fill(null);
  if (values.length < period) return result;

  let ema = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  result[period - 1] = ema;
  const alpha = 2 / (period + 1);
  for (let index = period; index < values.length; index++) {
    ema = values[index]! * alpha + ema * (1 - alpha);
    result[index] = ema;
  }
  return result;
}

export function calculateRsi(values: number[], period = 14): Array<number | null> {
  validatePeriod(period);
  validatePrices(values);

  const result: Array<number | null> = Array(values.length).fill(null);
  if (values.length <= period) return result;

  let averageGain = 0;
  let averageLoss = 0;
  for (let index = 1; index <= period; index++) {
    const change = values[index]! - values[index - 1]!;
    if (change > 0) averageGain += change;
    else averageLoss -= change;
  }
  averageGain /= period;
  averageLoss /= period;
  result[period] = rsiValue(averageGain, averageLoss);

  for (let index = period + 1; index < values.length; index++) {
    const change = values[index]! - values[index - 1]!;
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    result[index] = rsiValue(averageGain, averageLoss);
  }
  return result;
}

export function calculateMomentum(values: number[], period = 14): number | null {
  validatePeriod(period);
  validatePrices(values);
  if (values.length <= period) return null;

  const referenceClose = values[values.length - period - 1]!;
  if (referenceClose === 0) return null;
  return values.at(-1)! / referenceClose * 100;
}

function rsiValue(averageGain: number, averageLoss: number): number {
  if (averageGain === 0 && averageLoss === 0) return 50;
  if (averageLoss === 0) return 100;
  if (averageGain === 0) return 0;
  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}
