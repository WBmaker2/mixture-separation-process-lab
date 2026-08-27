import type { ProcessStep, SieveGap } from '../domain/contracts';
export function buildIntegratedPlan(gap: Exclude<SieveGap, 'fine-gap'> = 'wide-gap'): readonly ProcessStep[] {
  return [
    { id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap } },
    { id: 'step-2', actionId: 'add-water', input: { source: 'step', stepId: 'step-1', port: 'pass' }, evidencePropertyId: 'water-solubility', params: {} },
    { id: 'step-3', actionId: 'filtration', input: { source: 'step', stepId: 'step-2', port: 'mixture' }, evidencePropertyId: 'filter-behavior', params: {} },
    { id: 'step-4', actionId: 'virtual-evaporation', input: { source: 'step', stepId: 'step-3', port: 'filtrate' }, evidencePropertyId: 'evaporation-residue', params: {} },
  ];
}
