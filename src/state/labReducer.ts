import type { MissionId, MaterialId, ProcessStep } from '../domain/contracts';
import { getMission, missionTargetsReady } from '../domain/missions';
import { computeQuality, evaluateRun } from '../simulation/quality';
import { runProcess, validatePlan } from '../simulation/runProcess';
import type { LabAction, LabSession, AttentionActionId } from './contracts';

const clonePlan = (p: readonly ProcessStep[]) => p.map((s) => ({ ...s, input: { ...s.input }, params: { ...s.params } })) as ProcessStep[];
export function createInitialSession(): LabSession { return { schemaVersion: 1, stage: 'intake', attempt: 'initial', missionId: null, selectedTargetIds: [], confirmedPropertyIds: [], draftPlan: [], planHistory: [], initialPlan: null, revisedPlan: null, predictions: {}, completedStepIds: [], currentRun: null, recoveryClaims: [], revisionReason: '', sustainabilityReflection: '' }; }
function planChange(state: LabSession, plan: readonly ProcessStep[]): LabSession { return { ...state, draftPlan: clonePlan(plan), planHistory: [...state.planHistory, clonePlan(state.draftPlan)] }; }
function missionTargets(id: MissionId): readonly MaterialId[] { const m = getMission(id); return m.goal.mode === 'all-components' ? [...m.goal.requiredTargets] : []; }
function targetsOkay(s: LabSession) { return missionTargetsReady(s.missionId, s.selectedTargetIds); }
function accepted(s: LabSession) { if (!s.missionId || !s.currentRun) return false; const q = computeQuality(s.currentRun, s.recoveryClaims, s.selectedTargetIds); return evaluateRun(s.currentRun, q, s.confirmedPropertyIds).accepted; }
function complete(s: LabSession) { const ids = new Set(s.draftPlan.map((p) => p.id)); return s.completedStepIds.length === ids.size && s.completedStepIds.every((id) => ids.has(id)); }
function validClaim(s: LabSession, materialId: MaterialId, streamId: string) { if (!s.missionId || !s.currentRun) return false; const mission = getMission(s.missionId); const targets = mission.goal.mode === 'all-components' ? mission.goal.requiredTargets : s.selectedTargetIds; return targets.includes(materialId) && s.currentRun.activeLeafStreamIds.includes(streamId) && Boolean(s.currentRun.streams[streamId]); }
function startSimulation(s: LabSession): LabSession { if (!s.missionId || !targetsOkay(s) || !s.draftPlan.length || (s.stage !== 'design' && s.stage !== 'revision') || !getMission(s.missionId).requiredPropertyIds.every((p) => s.confirmedPropertyIds.includes(p)) || validatePlan(getMission(s.missionId), s.draftPlan, s.confirmedPropertyIds).length) return s; if (s.stage === 'revision' && (!s.initialPlan || s.revisionReason.trim().length < 10 || JSON.stringify(s.draftPlan) === JSON.stringify(s.initialPlan))) return s; return { ...s, stage: 'simulation', currentRun: runProcess(getMission(s.missionId), s.draftPlan), initialPlan: s.initialPlan ?? clonePlan(s.draftPlan), completedStepIds: [], predictions: {}, recoveryClaims: [] }; }
function revisedReady(s: LabSession) { const ids = new Set(s.draftPlan.map((p) => p.id)); return s.stage === 'quality' && s.attempt === 'revised' && s.initialPlan !== null && Boolean(s.currentRun) && s.completedStepIds.length === ids.size && s.completedStepIds.every((id) => ids.has(id)) && accepted(s) && s.draftPlan.length !== 0 && JSON.stringify(s.draftPlan) !== JSON.stringify(s.initialPlan) && s.revisionReason.trim().length >= 10; }
export function labReducer(state: LabSession, action: LabAction): LabSession {
  switch (action.type) {
    case 'select-mission': { const targets = missionTargets(action.missionId); return { ...createInitialSession(), missionId: action.missionId, selectedTargetIds: targets }; }
    case 'set-targets': { if (!state.missionId) return state; const m = getMission(state.missionId); const valid = action.materialIds.filter((x, i, a) => a.indexOf(x) === i && m.goal.mode === 'single-choice' && m.goal.selectableTargets.includes(x)); const selected = m.goal.mode === 'all-components' ? [...m.goal.requiredTargets] : valid; return { ...state, selectedTargetIds: selected }; }
    case 'toggle-property': { const has = state.confirmedPropertyIds.includes(action.propertyId); return { ...state, confirmedPropertyIds: has ? state.confirmedPropertyIds.filter((x) => x !== action.propertyId) : [...state.confirmedPropertyIds, action.propertyId] }; }
    case 'add-step': return planChange(state, [...state.draftPlan, action.step]);
    case 'replace-step': { const i = state.draftPlan.findIndex((x) => x.id === action.stepId); return i < 0 ? state : planChange(state, state.draftPlan.map((x, n) => n === i ? action.replacement : x)); }
    case 'move-step': { const i = state.draftPlan.findIndex((x) => x.id === action.stepId); const j = action.direction === 'up' ? i - 1 : i + 1; if (i < 0 || j < 0 || j >= state.draftPlan.length) return state; const p = [...state.draftPlan]; [p[i], p[j]] = [p[j], p[i]]; return planChange(state, p); }
    case 'remove-step': { const p = state.draftPlan.filter((x) => x.id !== action.stepId); return p.length === state.draftPlan.length ? state : planChange(state, p); }
    case 'undo-plan': { if (!state.planHistory.length) return state; const history = [...state.planHistory]; const p = history.pop()!; return { ...state, draftPlan: clonePlan(p), planHistory: history }; }
    case 'restore-initial-plan': return state.initialPlan && JSON.stringify(state.draftPlan) !== JSON.stringify(state.initialPlan) ? planChange(state, state.initialPlan) : state;
    case 'start-simulation': return startSimulation(state);
    case 'record-prediction': return state.draftPlan.some((x) => x.id === action.stepId) ? { ...state, predictions: { ...state.predictions, [action.stepId]: action.port } } : state;
    case 'record-step-complete': return state.draftPlan.some((x) => x.id === action.stepId) && !state.completedStepIds.includes(action.stepId) ? { ...state, completedStepIds: [...state.completedStepIds, action.stepId] } : state;
    case 'set-run': return { ...state, currentRun: action.run };
    case 'set-recovery-claim': return { ...state, recoveryClaims: validClaim(state, action.claim.materialId, action.claim.streamId) ? [...state.recoveryClaims.filter((x) => x.materialId !== action.claim.materialId), action.claim] : state.recoveryClaims.filter((x) => x.materialId !== action.claim.materialId) };
    case 'begin-revision': return state.stage !== 'quality' || state.attempt !== 'initial' || !state.missionId || !state.initialPlan ? state : { ...state, attempt: 'revised', stage: 'revision', revisedPlan: null, currentRun: null, predictions: {}, completedStepIds: [], recoveryClaims: [], revisionReason: '' };
    case 'set-revision-reason': return { ...state, revisionReason: action.reason };
    case 'set-sustainability-reflection': return { ...state, sustainabilityReflection: action.reflection };
    case 'finish-revision': return revisedReady(state) ? { ...state, stage: 'report', revisedPlan: clonePlan(state.draftPlan) } : state;
    case 'advance': {
      if (state.stage === 'intake' && state.missionId && targetsOkay(state)) return { ...state, stage: 'properties' };
      if (state.stage === 'properties' && state.missionId && getMission(state.missionId).requiredPropertyIds.every((x) => state.confirmedPropertyIds.includes(x))) return { ...state, stage: 'design' };
      if (state.stage === 'design') return startSimulation(state);
      if (state.stage === 'simulation' && state.currentRun && complete(state)) return { ...state, stage: 'quality' };
      if (state.stage === 'quality' && accepted(state)) return state.attempt === 'initial' && state.missionId !== 'integrated-process' ? { ...state, stage: 'report' } : state;
      if (state.stage === 'revision') return startSimulation(state);
      return state;
    }
    case 'reset-mission': return createInitialSession();
  }
}
export function getAttentionActionId(state: LabSession): AttentionActionId | null {
  if (state.stage === 'intake') return state.missionId ? (targetsOkay(state) ? null : 'select-target') : 'select-mission';
  if (state.stage === 'properties') return state.missionId && getMission(state.missionId).requiredPropertyIds.every((x) => state.confirmedPropertyIds.includes(x)) ? null : 'confirm-properties';
  if (state.stage === 'design') return startSimulation(state) === state ? 'prepare-simulation' : 'prepare-simulation';
  if (state.stage === 'simulation') return !complete(state) ? 'predict-next-step' : state.currentRun ? 'inspect-quality' : 'prepare-simulation';
  if (state.stage === 'quality') return accepted(state) ? (state.attempt === 'initial' && state.missionId === 'integrated-process' ? 'revise-process' : 'complete-report') : 'inspect-quality';
  if (state.stage === 'revision') { const validRevision = Boolean(state.initialPlan && state.missionId && state.draftPlan.length && !validatePlan(getMission(state.missionId), state.draftPlan, state.confirmedPropertyIds).length && state.revisionReason.trim().length >= 10 && JSON.stringify(state.draftPlan) !== JSON.stringify(state.initialPlan)); return validRevision ? 'prepare-simulation' : 'revise-process'; }
  if (state.stage === 'report') return null;
  return null;
}
