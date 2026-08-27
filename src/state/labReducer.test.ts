import { describe, expect, it } from 'vitest';
import { buildIntegratedPlan } from '../test/missionBuilders';
import { MISSIONS } from '../domain/missions';
import { createInitialSession, getAttentionActionId, labReducer } from './labReducer';
import type { LabSession } from './contracts';
import { runProcess } from '../simulation/runProcess';

describe('labReducer', () => {
  it('enforces mission then target then properties before design', () => {
    let state = createInitialSession();
    expect(state.stage).toBe('intake');
    state = labReducer(state, { type: 'select-mission', missionId: 'size-sort' });
    state = labReducer(state, { type: 'set-targets', materialIds: ['sand'] });
    state = labReducer(state, { type: 'advance' });
    expect(state.stage).toBe('properties');
    expect(getAttentionActionId(state)).toBe('confirm-properties');
  });

  it('keeps undo, replacement, movement, and initial restoration deterministic', () => {
    const plan = buildIntegratedPlan();
    let state: LabSession = { ...createInitialSession(), missionId: 'integrated-process', selectedTargetIds: ['gravel', 'sand', 'salt'], confirmedPropertyIds: ['particle-size','water-solubility','filter-behavior','evaporation-residue'], stage: 'design' };
    for (const step of plan) state = labReducer(state, { type: 'add-step', step });
    state = labReducer(state, { type: 'start-simulation' });
    expect(state.initialPlan).toEqual(plan);
    state = { ...state, stage: 'quality' };
    state = labReducer(state, { type: 'begin-revision' });
    state = labReducer(state, { type: 'remove-step', stepId: 'step-4' });
    state = labReducer(state, { type: 'undo-plan' });
    expect(state.draftPlan).toEqual(plan);
    state = labReducer(state, { type: 'remove-step', stepId: 'step-4' });
    state = labReducer(state, { type: 'restore-initial-plan' });
    expect(state.draftPlan).toEqual(plan);
  });

  it('allows only one attention action at a time', () => expect(getAttentionActionId(createInitialSession())).toBe('select-mission'));
  it('blocks simulation and revision shortcuts and avoids no-op history', () => { const initial = createInitialSession(); expect(labReducer(initial, { type: 'start-simulation' })).toBe(initial); expect(labReducer({ ...initial, stage: 'design', missionId: 'size-sort' }, { type: 'begin-revision' }).attempt).toBe('initial'); const same = { ...initial, initialPlan: [] as const, draftPlan: [] as const }; expect(labReducer(same, { type: 'restore-initial-plan' })).toBe(same); });
  it('keeps integrated initial and revised quality in quality until explicit actions', () => { const integrated: LabSession = { ...createInitialSession(), stage: 'quality', attempt: 'initial', missionId: 'integrated-process', initialPlan: [] }; expect(labReducer(integrated, { type: 'advance' })).toBe(integrated); const revised: LabSession = { ...integrated, attempt: 'revised' }; expect(labReducer(revised, { type: 'advance' })).toBe(revised); expect(labReducer(revised, { type: 'finish-revision' })).toBe(revised); });
  it('requires a second executed process before the integrated report', () => {
    const initialPlan = buildIntegratedPlan('wide-gap');
    let state: LabSession = { ...createInitialSession(), missionId: 'integrated-process', selectedTargetIds: ['gravel', 'sand', 'salt'], stage: 'quality', initialPlan, draftPlan: initialPlan, attempt: 'initial' };
    state = labReducer(state, { type: 'advance' }); expect(state.stage).toBe('quality');
    state = labReducer(state, { type: 'begin-revision' }); expect(state.attempt).toBe('revised'); expect(state.stage).toBe('revision');
  });
  it('requires a changed process and a reason before saving a revision', () => {
    const plan = buildIntegratedPlan();
    const state: LabSession = { ...createInitialSession(), stage: 'revision', attempt: 'revised', missionId: 'integrated-process', selectedTargetIds: ['gravel', 'sand', 'salt'], initialPlan: plan, draftPlan: plan, revisionReason: '소금의 위치를 다시 확인했습니다.' };
    expect(labReducer(state, { type: 'finish-revision' }).stage).toBe('revision');
  });
  it('clears stale or non-target recovery claims', () => {
    const plan = buildIntegratedPlan();
    const currentRun = runProcess(MISSIONS['integrated-process'], plan);
    const state: LabSession = { ...createInitialSession(), stage: 'quality', missionId: 'integrated-process', selectedTargetIds: ['gravel', 'sand', 'salt'], currentRun, recoveryClaims: [{ materialId: 'gravel', streamId: 'initial' }] };
    expect(labReducer(state, { type: 'set-recovery-claim', claim: { materialId: 'gravel', streamId: 'unknown' } }).recoveryClaims).toEqual([]);
  });
});
