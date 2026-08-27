import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../domain/missions';
import { buildIntegratedPlan } from '../test/missionBuilders';
import { getGuidingQuestion } from './feedback';
import { computeQuality, evaluateRun } from './quality';
import { runProcess, validatePlan } from './runProcess';

const integratedClaims = [
  { materialId: 'gravel', streamId: 'step-1:retained' },
  { materialId: 'sand', streamId: 'step-3:filter-residue' },
  { materialId: 'salt', streamId: 'step-4:solid-residue' },
] as const;

describe('process execution and outcome-based evaluation', () => {
  it('runs the same plan to a deeply equal state every time', () => {
    const mission = MISSIONS['integrated-process']; const plan = buildIntegratedPlan('wide-gap');
    expect(runProcess(mission, plan)).toEqual(runProcess(mission, plan));
  });
  it.each(['wide-gap', 'medium-gap'] as const)('accepts %s', (gap) => {
    const mission = MISSIONS['integrated-process']; const run = runProcess(mission, buildIntegratedPlan(gap));
    const quality = computeQuality(run, integratedClaims, mission.goal.requiredTargets);
    expect(evaluateRun(run, quality, mission.requiredPropertyIds).accepted).toBe(true);
    expect(quality.byTarget.salt?.recoveredBand).toBe('mostly');
    expect(quality.byTarget.salt?.lostCount).toBe(1);
  });
  it('preserves a complete path for every initial token', () => {
    const run = runProcess(MISSIONS['integrated-process'], buildIntegratedPlan());
    for (const id of run.initialTokenIds) { expect(run.movements.some((m) => m.tokenId === id)).toBe(true); expect(run.finalLocationByTokenId[id]).toBeDefined(); }
  });
  it('asks a location question before revealing a process order', () => {
    const mission = MISSIONS['salt-recovery']; const run = runProcess(mission, []);
    const q = getGuidingQuestion(evaluateRun(run, computeQuality(run, [], ['salt']), []), run);
    expect(q).toMatch(/어느 쪽|어떤 성질|무엇이 남/); expect(q).not.toContain('정답 순서'); expect(q.endsWith('?')).toBe(true);
  });
  it('treats a missing claim stream as no claim', () => {
    const mission = MISSIONS['salt-recovery']; const run = runProcess(mission, []);
    const quality = computeQuality(run, [{ materialId: 'salt', streamId: 'missing-stream' }], ['salt']);
    expect(quality.byTarget.salt?.claimedStreamId).toBeNull();
    expect(quality.byTarget.salt?.recoveredCount).toBe(0);
    expect(evaluateRun(run, quality, mission.requiredPropertyIds).issueCodes).toContain('missing-claim');
  });
  it('reports a runtime missing port after a no-basis step', () => {
    const mission = MISSIONS['integrated-process'];
    const plan = [{ id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap: 'fine-gap' } }, { id: 'step-2', actionId: 'add-water', input: { source: 'step', stepId: 'step-1', port: 'pass' }, evidencePropertyId: 'water-solubility', params: {} }] as const;
    expect(runProcess(mission, plan).planIssues).toEqual(expect.arrayContaining([expect.objectContaining({ stepId: 'step-2', code: 'input-not-found' })]));
  });
  it('allows unchanged output after a no-basis step', () => {
    const mission = MISSIONS['integrated-process'];
    const plan = [{ id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap: 'fine-gap' } }, { id: 'step-2', actionId: 'add-water', input: { source: 'step', stepId: 'step-1', port: 'unchanged' }, evidencePropertyId: 'water-solubility', params: {} }] as const;
    expect(validatePlan(mission, plan, mission.requiredPropertyIds).some((issue) => issue.code === 'input-not-found')).toBe(false);
    expect(runProcess(mission, plan).outcomes.some((outcome) => outcome.status === 'no-basis')).toBe(true);
  });
});
