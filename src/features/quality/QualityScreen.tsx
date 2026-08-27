import { useMemo, type Dispatch } from 'react';
import type { MaterialId, MissionDefinition, PropertyId, RecoveryClaim } from '../../domain/contracts';
import type { SimulationRun } from '../../simulation/contracts';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import { computeQuality, evaluateRun } from '../../simulation/quality';
import { getGuidingQuestion } from '../../simulation/feedback';
import { ACTIONS } from '../../domain/actions';
import { RecoveryClaimPanel } from './RecoveryClaimPanel';
import { QualityLedger } from './QualityLedger';
export interface QualityScreenProps { mission: MissionDefinition; run: SimulationRun; attempt: 'initial' | 'revised'; confirmedPropertyIds: readonly PropertyId[]; claims: readonly RecoveryClaim[]; selectedTargetIds?: readonly MaterialId[]; attentionActionId: AttentionActionId | null; dispatch: Dispatch<LabAction>; }
export function QualityScreen({ mission, run, attempt, confirmedPropertyIds, claims, selectedTargetIds, attentionActionId, dispatch }: QualityScreenProps) {
  const targetIds = useMemo(() => selectedTargetIds?.length ? selectedTargetIds : mission.goal.mode === 'all-components' ? mission.goal.requiredTargets : [claims[0]?.materialId ?? mission.goal.selectableTargets[0]], [selectedTargetIds, mission, claims]);
  const summary = useMemo(() => computeQuality(run, claims, targetIds), [run, claims, targetIds]);
  const evaluation = useMemo(() => evaluateRun(run, summary, confirmedPropertyIds), [run, summary, confirmedPropertyIds]);
  const question = getGuidingQuestion(evaluation, run);
  const revision = !evaluation.accepted || (attempt === 'initial' && mission.id === 'integrated-process');
  const buttonLabel = revision ? '문제 단계 수정하기' : attempt === 'revised' ? '수정 공정 보고서 만들기' : '결과를 바탕으로 공정 설명하기';
  const action = revision ? 'begin-revision' : attempt === 'revised' ? 'finish-revision' : 'advance';
  const problem = evaluation.firstProblemStepId;
  const needsPulse = revision ? attentionActionId === 'revise-process' || attentionActionId === 'inspect-quality' : attentionActionId === 'complete-report';
  return <section className="screen quality-screen" aria-labelledby="quality-title"><header className="hero-copy"><p className="eyebrow">품질 검사</p><h2 id="quality-title">결과를 살펴보고 회수 주장을 세워 보세요</h2><p>가상 토큰의 이동을 근거로 목표 물질이 남은 마지막 물질함을 선택하세요.</p></header><p role="status" className="guiding-question">{question}</p><RecoveryClaimPanel mission={mission} run={run} claims={claims} targetIds={targetIds} dispatch={dispatch} /><QualityLedger summary={summary} targetIds={targetIds} />{problem && <p className="problem-step-badge">문제 살펴보기: {(() => { const step = run.outcomes.find((outcome) => outcome.stepId === problem); return step ? `${step.stepId.replace('step-', '')}단계 · ${ACTIONS[step.actionId].name}` : '해당 단계'; })()}</p>}<button type="button" className={`primary-action${needsPulse ? ' gi-pulse' : ''}`} onClick={() => dispatch({ type: action } as LabAction)}>{buttonLabel}</button></section>;
}
