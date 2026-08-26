import type { MissionDefinition, ProcessStep, PropertyId, OutputPortId } from '../domain/contracts';
import { ACTIONS } from '../domain/actions';
import { createInitialSimulation } from './tokenFactory';
import { applyProcessStep } from './applyProcessStep';
import { outputStreamId, resolveStreamRef } from './streamRefs';
import type { MaterialStream, PlanIssue, PlanIssueCode, ProcessOutcome, SimulationRun, SimulationState } from './contracts';

const ports: Record<ProcessStep['actionId'], readonly OutputPortId[]> = {
  sieve: ['pass', 'retained'], 'add-water': ['mixture'], filtration: ['filtrate', 'filter-residue'], 'virtual-evaporation': ['vapor-model', 'solid-residue'],
  'layer-separation': ['upper', 'lower'], 'wait-for-layers': ['layered-mixture'],
};
const issue = (code: PlanIssueCode, stepId: string, message: string): PlanIssue => ({ code, stepId, message });

export function validatePlan(mission: MissionDefinition, plan: readonly ProcessStep[], confirmedPropertyIds: readonly PropertyId[] = []): readonly PlanIssue[] {
  const issues: PlanIssue[] = []; const ids = new Set<string>(); const produced = new Map<string, Set<string>>(); const consumed = new Map<string, string>();
  plan.forEach((step, index) => {
    const duplicate = ids.has(step.id); if (duplicate) issues.push(issue('duplicate-step-id', step.id, '단계 ID가 중복됩니다.')); else ids.add(step.id);
    const allowed = mission.allowedActionIds.includes(step.actionId);
    if (!allowed) issues.push(issue('action-not-allowed', step.id, '이 미션에서 허용되지 않은 행동입니다.'));
    const required = ACTIONS[step.actionId]?.requiredPropertyIds ?? [];
    const validEvidence = required.includes(step.evidencePropertyId);
    if (!validEvidence) issues.push(issue('invalid-evidence', step.id, '행동에 맞지 않는 성질 근거입니다.'));
    else if (!confirmedPropertyIds.includes(step.evidencePropertyId)) issues.push(issue('property-not-confirmed', step.id, '성질 확인이 필요합니다.'));
    const ref = step.input;
    let streamId: string | null = null;
    if (ref.source === 'initial') streamId = 'initial';
    else if (index <= plan.findIndex((candidate) => candidate.id === ref.stepId)) issues.push(issue('future-input-reference', step.id, '아직 실행되지 않은 단계를 참조합니다.'));
    else {
      const available = produced.get(ref.stepId);
      if (!available || !available.has(ref.port)) issues.push(issue('input-not-found', step.id, '입력 물질함 또는 출력 포트를 찾을 수 없습니다.'));
      else streamId = outputStreamId(ref.stepId, ref.port);
    }
    const executable = !duplicate && allowed && validEvidence && streamId !== null;
    if (streamId && consumed.has(streamId) && executable) issues.push(issue('input-already-consumed', step.id, '이미 소비된 입력 물질함입니다.'));
    if (streamId && executable && !consumed.has(streamId)) consumed.set(streamId, step.id);
    if (executable) produced.set(step.id, new Set(ports[step.actionId]));
  });
  return issues;
}

export function runProcess(mission: MissionDefinition, plan: readonly ProcessStep[]): SimulationRun {
  let state: SimulationState = createInitialSimulation(mission);
  const structural = validatePlan(mission, plan, mission.requiredPropertyIds).filter((i) => i.code !== 'property-not-confirmed');
  const outcomes: ProcessOutcome[] = [];
  plan.forEach((step) => {
    const stepIssues = structural.filter((i) => i.stepId === step.id);
    if (stepIssues.length) return;
    const input = resolveStreamRef(state, step.input);
    if (!input || input.consumedByStepId) return;
    const outcome = applyProcessStep({ missionId: mission.id, step, input, tokens: state.tokens });
    const streams: Record<string, MaterialStream> = { ...state.streams, [input.id]: { ...input, consumedByStepId: step.id } };
    outcome.outputs.forEach(({ stream }) => { streams[stream.id] = { ...stream, tokenIds: [...stream.tokenIds], condition: { ...stream.condition }, consumedByStepId: null }; });
    state = { missionId: mission.id, tokens: { ...outcome.tokens }, streams, outcomes: [...state.outcomes, outcome], movements: [...state.movements, ...outcome.movements], lostTokenIds: [...state.lostTokenIds, ...outcome.lostTokenIds] };
    outcomes.push(outcome);
  });
  const activeLeafStreamIds = Object.values(state.streams).filter((stream) => stream.consumedByStepId === null).map((stream) => stream.id).sort();
  const finalLocationByTokenId: Record<string, string | 'loss'> = {};
  Object.keys(state.tokens).forEach((tokenId) => { const last = [...state.movements].reverse().find((movement) => movement.tokenId === tokenId); finalLocationByTokenId[tokenId] = last?.toStreamId ?? 'initial'; });
  return { ...state, outcomes, initialTokenIds: Object.values(state.streams.initial?.tokenIds ?? []), activeLeafStreamIds, finalLocationByTokenId, planIssues: structural };
}
