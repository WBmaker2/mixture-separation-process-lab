import { describe, expect, it } from 'vitest';
import type { ProcessOutcome, SimulationRun, MaterialToken } from './contracts';
import type { ProcessStep } from '../domain/contracts';
import { getExpectedPredictionPorts, getPredictionTargetMaterialId, evaluatePrediction, predictionQuestion } from './prediction';
import { getGuidingQuestion } from './feedback';

const token = (id: string, materialId: MaterialToken['materialId']): MaterialToken => ({ id, materialId, origin: 'initial', phase: materialId === 'oil' || materialId === 'water' ? 'liquid' : 'solid' });
const outcome = (movements: ProcessOutcome['movements'], tokens: ProcessOutcome['tokens']): ProcessOutcome => ({ stepId: 'step-1', actionId: 'layer-separation', status: 'applied', reasonCode: null, explanation: '', tokens, outputs: [], movements, addedTokenIds: [], lostTokenIds: [] });
const step = { id: 'step-1', actionId: 'layer-separation', input: { source: 'initial' }, evidencePropertyId: 'immiscibility', params: {} } as ProcessStep;
const run = (tokens: Readonly<Record<string, MaterialToken>>): SimulationRun => ({ missionId: 'liquid-layers', tokens, streams: { initial: { id: 'initial', tokenIds: Object.keys(tokens), condition: { waterAdded: false, layersSettled: true }, consumedByStepId: 'step-1' } }, outcomes: [], movements: [], lostTokenIds: [], initialTokenIds: Object.keys(tokens), activeLeafStreamIds: [], finalLocationByTokenId: {}, planIssues: [] });

describe('prediction', () => {
  it('judges the selected oil target by its dominant layer', () => {
    const tokens = Object.fromEntries([...Array(9)].map((_, i) => [`oil-${i}`, token(`oil-${i}`, 'oil')]).concat([['oil-loss', token('oil-loss', 'oil')]]));
    const movements = Object.keys(tokens).map((tokenId, index) => ({ tokenId, stepId: 'step-1', fromStreamId: 'initial', toStreamId: index === 9 ? 'step-1:lower' : 'step-1:upper', reason: 'layer' }));
    const result = evaluatePrediction(outcome(movements, tokens), 'oil', 'lower');
    expect(getExpectedPredictionPorts(outcome(movements, tokens), 'oil')).toEqual(['upper']);
    expect(result.matched).toBe(false);
  });

  it('ignores a minority loss when salt mostly reaches solid residue', () => {
    const tokens = Object.fromEntries([...Array(9)].map((_, i) => [`salt-${i}`, token(`salt-${i}`, 'salt')]).concat([['salt-loss', token('salt-loss', 'salt')]]));
    const movements = Object.keys(tokens).map((tokenId, index) => ({ tokenId, stepId: 'step-4', fromStreamId: 'step-3:filtrate', toStreamId: index === 9 ? 'loss' : 'step-4:solid-residue', reason: 'evaporate' }));
    const result = outcome(movements, tokens);
    expect(getExpectedPredictionPorts(result, 'salt')).toEqual(['solid-residue']);
  });

  it('uses unchanged when the target has no movement basis', () => {
    const tokens = { 'oil-1': token('oil-1', 'oil') };
    expect(getExpectedPredictionPorts(outcome([], tokens), 'oil')).toEqual(['unchanged']);
  });

  it('asks about the target without embedding an answer hint', () => {
    const question = predictionQuestion('sand', 'sieve');
    expect(question).toContain('고운 모래');
    expect(question).not.toContain('자갈은 잔류');
  });

  it('guides from the selected target only', () => {
    const evaluation = { accepted: false, issueCodes: ['almost-no-recovery'] as const, firstProblemStepId: null };
    expect(getGuidingQuestion(evaluation, run({}), ['sand'])).not.toContain('소금');
  });

  it('finds a selected target in the current input stream', () => {
    const tokens = { 'oil-1': token('oil-1', 'oil'), 'water-1': token('water-1', 'water') };
    expect(getPredictionTargetMaterialId(run(tokens), step, ['oil'])).toBe('oil');
  });
});
