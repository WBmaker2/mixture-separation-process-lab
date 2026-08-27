import { describe, expect, it, vi } from 'vitest';
import { createInitialSession } from './labReducer';
import { loadSession, saveSession, serializeSession, STORAGE_KEY } from './persistence';
import { MISSIONS } from '../domain/missions';
import { runProcess } from '../simulation/runProcess';
import { buildIntegratedPlan } from '../test/missionBuilders';
describe('local-only persistence', () => {
  it('saves only the versioned learning session and no student identity field', () => { const setItem = vi.fn(); saveSession({ setItem }, createInitialSession()); const saved = setItem.mock.calls[0][1] as string; expect(setItem).toHaveBeenCalledOnce(); expect(saved).toContain('"schemaVersion":1'); expect(saved).not.toMatch(/studentName|realName|email/); });
  it('recovers valid sessions and resets malformed or unknown versions', () => { const valid = JSON.stringify(createInitialSession()); expect(loadSession({ getItem: () => valid }).schemaVersion).toBe(1); expect(loadSession({ getItem: () => '{bad json' })).toEqual(createInitialSession()); expect(loadSession({ getItem: () => JSON.stringify({ schemaVersion: 99 }) })).toEqual(createInitialSession()); expect(STORAGE_KEY).toBe('mixture-separation-process-lab:v1'); });
  it('fails closed for malformed nested plans and incomplete runs', () => { const base = createInitialSession(); expect(loadSession({ getItem: () => JSON.stringify({ ...base, draftPlan: [{ id: 'x', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'wrong', params: { gap: 'wide-gap' } }] }) })).toEqual(base); expect(loadSession({ getItem: () => JSON.stringify({ ...base, currentRun: {} }) })).toEqual(base); });
  it('strips nested identity fields while preserving valid session data', () => { const state: any = { ...createInitialSession(), predictions: { step: 'pass', studentName: 'x' }, draftPlan: [{ id: 'x', actionId: 'sieve', input: { source: 'initial', email: 'x' }, evidencePropertyId: 'particle-size', params: { gap: 'wide-gap' }, realName: 'x' }] }; const saved = serializeSession(state); expect(saved).not.toMatch(/studentName|realName|email/); });
  it('rejects unknown action and malformed output records', () => { const base = createInitialSession(); expect(loadSession({ getItem: () => JSON.stringify({ ...base, draftPlan: [{ id:'x', actionId:'unknown', input:{source:'initial'}, evidencePropertyId:'particle-size', params:{} }] }) })).toEqual(base); });
  it('round-trips a complete integrated run and strips unknown nested keys', () => {
    const run = runProcess(MISSIONS['integrated-process'], buildIntegratedPlan());
    const state: any = { ...createInitialSession(), missionId: 'integrated-process', currentRun: run };
    const saved = serializeSession(state);
    const loaded = loadSession({ getItem: () => saved });
    expect(loaded.currentRun).toEqual(run);
    const polluted = JSON.parse(saved);
    polluted.currentRun.tokens[Object.keys(polluted.currentRun.tokens)[0]].extra = 'x';
    polluted.currentRun.streams[Object.keys(polluted.currentRun.streams)[0]].condition.email = 'x';
    expect(loadSession({ getItem: () => JSON.stringify(polluted) })).toEqual(createInitialSession());
  });
  it('rejects broken run references and duplicate completion ids', () => {
    const run = runProcess(MISSIONS['integrated-process'], buildIntegratedPlan());
    const base: any = { ...createInitialSession(), missionId: 'integrated-process', currentRun: run };
    const bad: any = { ...base, currentRun: { ...run, movements: run.movements.map((movement, index) => index === 0 ? { ...movement, tokenId: 'missing' } : movement) } };
    expect(loadSession({ getItem: () => JSON.stringify(bad) })).toEqual(createInitialSession());
    expect(loadSession({ getItem: () => JSON.stringify({ ...base, completedStepIds: ['foreign', 'foreign'] }) })).toEqual(createInitialSession());
  });
  it('rejects unknown nested stream references and inherited map keys', () => {
    const run = runProcess(MISSIONS['integrated-process'], buildIntegratedPlan());
    const base: any = { ...createInitialSession(), missionId: 'integrated-process', currentRun: run };
    const first = run.outcomes[0];
    const badOutput: any = { ...base, currentRun: { ...run, outcomes: run.outcomes.map((outcome, index) => index === 0 ? { ...outcome, outputs: outcome.outputs.map((output, outputIndex) => outputIndex === 0 ? { ...output, stream: { ...output.stream, id: 'unknown-stream' } } : output) } : outcome) } };
    expect(loadSession({ getItem: () => JSON.stringify(badOutput) })).toEqual(createInitialSession());
    const badMovement: any = { ...base, currentRun: { ...run, outcomes: run.outcomes.map((outcome, index) => index === 0 ? { ...outcome, movements: outcome.movements.length ? outcome.movements.map((movement, movementIndex) => movementIndex === 0 ? { ...movement, fromStreamId: 'unknown-stream' } : movement) : outcome.movements } : outcome) } };
    expect(loadSession({ getItem: () => JSON.stringify(badMovement) })).toEqual(createInitialSession());
    const inherited: any = { ...base, currentRun: { ...run, movements: run.movements.map((movement, index) => index === 0 ? { ...movement, fromStreamId: 'toString' } : movement) } };
    expect(loadSession({ getItem: () => JSON.stringify(inherited) })).toEqual(createInitialSession());
    expect(first).toBeDefined();
  });
  it('rejects nested output streams consumed by unknown outcome steps and orphaned runs', () => {
    const run = runProcess(MISSIONS['integrated-process'], buildIntegratedPlan());
    const base: any = { ...createInitialSession(), missionId: 'integrated-process', currentRun: run };
    const polluted: any = { ...base, currentRun: { ...run, outcomes: run.outcomes.map((outcome, index) => index === 0 ? { ...outcome, outputs: outcome.outputs.map((output, outputIndex) => outputIndex === 0 ? { ...output, stream: { ...output.stream, consumedByStepId: 'unknown-step' } } : output) } : outcome) } };
    expect(loadSession({ getItem: () => JSON.stringify(polluted) })).toEqual(createInitialSession());
    expect(loadSession({ getItem: () => JSON.stringify({ ...base, missionId: null }) })).toEqual(createInitialSession());
  });
  it('resets sessions with __proto__ stream references', () => {
    const run = runProcess(MISSIONS['integrated-process'], buildIntegratedPlan());
    const base: any = { ...createInitialSession(), missionId: 'integrated-process', currentRun: run };
    const movementFrom: any = { ...base, currentRun: { ...run, movements: run.movements.map((movement, index) => index === 0 ? { ...movement, fromStreamId: '__proto__' } : movement) } };
    const movementTo: any = { ...base, currentRun: { ...run, movements: run.movements.map((movement, index) => index === 0 ? { ...movement, toStreamId: '__proto__' } : movement) } };
    const activeLeaf: any = { ...base, currentRun: { ...run, activeLeafStreamIds: ['__proto__'] } };
    const tokenId = run.initialTokenIds[0];
    const finalLocation: any = { ...base, currentRun: { ...run, finalLocationByTokenId: { ...run.finalLocationByTokenId, [tokenId]: '__proto__' } } };
    expect(loadSession({ getItem: () => JSON.stringify(movementFrom) })).toEqual(createInitialSession());
    expect(loadSession({ getItem: () => JSON.stringify(movementTo) })).toEqual(createInitialSession());
    expect(loadSession({ getItem: () => JSON.stringify(activeLeaf) })).toEqual(createInitialSession());
    expect(loadSession({ getItem: () => JSON.stringify(finalLocation) })).toEqual(createInitialSession());
  });
});
