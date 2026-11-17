import type { ScenarioMetrics, ScenarioPrices } from './types.js';
export type { ScenarioMetrics } from './types.js';

export interface ScenarioValidation {
  valid: boolean;
  errors: string[];
}

export function validateScenario(scenario: ScenarioPrices): ScenarioValidation {
  const errors: string[] = [];
  if (!scenario || typeof scenario !== 'object') {
    return { valid: false, errors: ['scenario is required'] };
  }
  if (scenario.direction !== 'buy' && scenario.direction !== 'sell') {
    errors.push('direction must be buy or sell');
  }

  const prices = [scenario.entryLow, scenario.entryHigh, scenario.stopLoss];
  const targets = Array.isArray(scenario.takeProfits) ? scenario.takeProfits : [];
  if (targets.length !== 3) errors.push('three take-profit prices are required');
  if ([...prices, ...targets].some(price => typeof price !== 'number' || !Number.isFinite(price))) {
    errors.push('all prices must be finite numbers');
  }
  if (errors.length > 0) return { valid: false, errors };

  if (scenario.entryLow > scenario.entryHigh) errors.push('entry range is reversed');
  const entryReference = (scenario.entryLow + scenario.entryHigh) / 2;
  const risk = Math.abs(entryReference - scenario.stopLoss);
  if (risk === 0) errors.push('risk must be greater than zero');

  if (scenario.direction === 'buy') {
    if (scenario.stopLoss >= scenario.entryLow) errors.push('buy stop must be below entry');
    if (scenario.takeProfits[0] <= scenario.entryHigh) errors.push('buy targets must be above entry');
    if (!(scenario.takeProfits[0] < scenario.takeProfits[1] && scenario.takeProfits[1] < scenario.takeProfits[2])) {
      errors.push('buy targets must be in ascending order');
    }
  } else if (scenario.direction === 'sell') {
    if (scenario.stopLoss <= scenario.entryHigh) errors.push('sell stop must be above entry');
    if (scenario.takeProfits[0] >= scenario.entryLow) errors.push('sell targets must be below entry');
    if (!(scenario.takeProfits[0] > scenario.takeProfits[1] && scenario.takeProfits[1] > scenario.takeProfits[2])) {
      errors.push('sell targets must be in descending order');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function calculateScenarioMetrics(scenario: ScenarioPrices): ScenarioMetrics {
  const validation = validateScenario(scenario);
  if (!validation.valid) {
    throw new RangeError(`invalid scenario: ${validation.errors.join(', ')}`);
  }

  const entryReference = (scenario.entryLow + scenario.entryHigh) / 2;
  const risk = Math.abs(entryReference - scenario.stopLoss);
  const rewardDistances = scenario.takeProfits.map(target => Math.abs(target - entryReference)) as [number, number, number];
  const rewardRisk = rewardDistances.map(reward => reward / risk) as [number, number, number];
  return {
    entryReference,
    risk,
    rewardDistances,
    rewardRisk,
    belowMinimumRewardRisk: rewardRisk.map(ratio => ratio < 2) as [boolean, boolean, boolean],
  };
}
