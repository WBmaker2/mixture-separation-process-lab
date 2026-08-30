import { useMemo, type Dispatch } from 'react';
import type { MaterialId, MissionDefinition, PropertyId, RecoveryClaim } from '../../domain/contracts';
import type { SimulationRun } from '../../simulation/contracts';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import { computeQuality, evaluateRun } from '../../simulation/quality';
import { getGuidingQuestion } from '../../simulation/feedback';
import { RecoveryClaimPanel } from './RecoveryClaimPanel';
import { QualityLedger } from './QualityLedger';
import { StageHeader } from '../../components/StageHeader';
import { LearningCallout } from '../../components/LearningCallout';
import { PrimaryAction } from '../../components/PrimaryAction';
import { STAGE_COPY } from '../../content/learningCopy';
export interface QualityScreenProps { mission: MissionDefinition; run: SimulationRun; attempt: 'initial' | 'revised'; confirmedPropertyIds: readonly PropertyId[]; claims: readonly RecoveryClaim[]; selectedTargetIds?: readonly MaterialId[]; attentionActionId: AttentionActionId | null; dispatch: Dispatch<LabAction>; }
export function QualityScreen({ mission, run, attempt, confirmedPropertyIds, claims, selectedTargetIds, attentionActionId, dispatch }: QualityScreenProps) {
  const targetIds = useMemo(() => { const allowed = mission.goal.mode === 'all-components' ? mission.goal.requiredTargets : mission.goal.selectableTargets; const selected = (selectedTargetIds ?? []).filter((id) => allowed.includes(id)); if (mission.goal.mode === 'all-components') return mission.goal.requiredTargets; return selected.length ? [selected[0]] : [allowed[0]]; }, [selectedTargetIds, mission]);
  const summary = useMemo(() => computeQuality(run, claims, targetIds), [run, claims, targetIds]);
  const evaluation = useMemo(() => evaluateRun(run, summary, confirmedPropertyIds), [run, summary, confirmedPropertyIds]);
  const question = getGuidingQuestion(evaluation, run, targetIds);
  const revision = !evaluation.accepted || (attempt === 'initial' && mission.id === 'integrated-process');
  const buttonLabel = revision ? '문제 단계 수정하기' : attempt === 'revised' ? '수정 공정 보고서 만들기' : '결과를 바탕으로 공정 설명하기';
  const action = revision ? 'begin-revision' : attempt === 'revised' ? 'finish-revision' : 'advance';
  const problem = evaluation.firstProblemStepId;
  const needsPulse = revision ? attentionActionId === 'revise-process' || attentionActionId === 'inspect-quality' : attentionActionId === 'complete-report';
  return <section className="screen quality-screen" aria-labelledby="stage-title"><StageHeader eyebrow={STAGE_COPY.quality.eyebrow} title="결과를 살펴보고 회수 주장을 세워 보세요" description={STAGE_COPY.quality.description} /><LearningCallout tone="question" title="추적 질문" role="status"><span className="guiding-question">{question}</span></LearningCallout><RecoveryClaimPanel mission={mission} run={run} claims={claims} targetIds={targetIds} dispatch={dispatch} /><QualityLedger summary={summary} targetIds={targetIds} />{problem && <article className="problem-step-card"><span className="problem-step-badge">문제 살펴보기</span><h3>{problem.replace('step-', '')}단계 결과</h3><p>이 단계의 관찰 결과를 다시 살펴보고, 어떤 성질과 물질의 위치를 근거로 바꿀지 생각해 보세요.</p></article>}<PrimaryAction type="button" attention={needsPulse} onClick={() => dispatch({ type: action } as LabAction)}>{buttonLabel}</PrimaryAction></section>;
}
