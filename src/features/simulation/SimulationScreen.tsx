import { useState, type Dispatch } from 'react';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import type { MaterialId, MissionDefinition, OutputPortId, ProcessStep } from '../../domain/contracts';
import type { SimulationRun } from '../../simulation/contracts';
import { ACTIONS } from '../../domain/actions';
import { SafetyNotice } from '../../components/SafetyNotice';
import { LiveRegion } from '../../components/LiveRegion';
import { TokenStatusTable } from '../../components/TokenStatusTable';
import { PredictionPrompt } from './PredictionPrompt';
import { MovementScene } from './MovementScene';
import { evaluatePrediction, getPredictionTargetMaterialId } from '../../simulation/prediction';
import { outputPortLabel } from '../../domain/displayLabels';
import { formatMovementAnnouncement, formatMovementPhaseMessage, type MovementPhase } from '../../simulation/movementCopy';
import { StageHeader } from '../../components/StageHeader';
import { LearningCallout } from '../../components/LearningCallout';
import { PrimaryAction } from '../../components/PrimaryAction';
import { STAGE_COPY } from '../../content/learningCopy';

const candidatePorts: Record<ProcessStep['actionId'], readonly OutputPortId[]> = {
  sieve: ['pass', 'retained', 'unchanged'], 'wait-for-layers': ['layered-mixture', 'unchanged'], 'layer-separation': ['upper', 'lower', 'unchanged'], 'add-water': ['mixture', 'unchanged'], filtration: ['filtrate', 'filter-residue', 'unchanged'], 'virtual-evaporation': ['vapor-model', 'solid-residue', 'unchanged'],
};
function inputIds(run: SimulationRun, step: ProcessStep): readonly string[] { const streamId = step.input.source === 'initial' ? 'initial' : `${step.input.stepId}:${step.input.port}`; return run.streams[streamId]?.tokenIds ?? []; }

export interface SimulationScreenProps { mission: MissionDefinition; plan: readonly ProcessStep[]; fullRun: SimulationRun; completedStepIds: readonly string[]; predictions: Readonly<Record<string, OutputPortId>>; selectedTargetIds: readonly MaterialId[]; attentionActionId: AttentionActionId | null; reducedMotion: boolean; dispatch: Dispatch<LabAction>; }
export function SimulationScreen({ mission, plan, fullRun, completedStepIds, predictions, selectedTargetIds, attentionActionId, reducedMotion, dispatch }: SimulationScreenProps) {
  const currentIndex = plan.findIndex((step) => !completedStepIds.includes(step.id));
  const current = currentIndex >= 0 ? plan[currentIndex] : null;
  const outcome = current ? fullRun.outcomes.find((item) => item.stepId === current.id) : null;
  const completedOutcomes = fullRun.outcomes.filter((item) => completedStepIds.includes(item.stepId));
  const [localPredictions, setLocalPredictions] = useState<Readonly<Record<string, OutputPortId>>>({});
  const [movementPhases, setMovementPhases] = useState<Readonly<Record<string, MovementPhase>>>(() => Object.fromEntries(fullRun.outcomes.map((item) => [item.stepId, reducedMotion || item.status === 'no-basis' ? 'complete' : 'moving'])));
  const phaseFor = (item: SimulationRun['outcomes'][number]): MovementPhase => reducedMotion || item.status === 'no-basis' ? 'complete' : movementPhases[item.stepId] ?? 'moving';
  const latestOutcome = completedOutcomes.at(-1);
  const selectedPrediction = current ? predictions[current.id] ?? localPredictions[current.id] : undefined;
  const targetMaterialId = current ? getPredictionTargetMaterialId(fullRun, current, selectedTargetIds) : null;
  const runCurrent = () => { if (!current || !selectedPrediction || !outcome) return; dispatch({ type: 'record-step-complete', stepId: current.id }); if (completedStepIds.length + 1 >= plan.length) dispatch({ type: 'set-run', run: fullRun }); };
  return <section className="screen simulation-screen" aria-labelledby="stage-title"><StageHeader eyebrow={`${STAGE_COPY.simulation.eyebrow} · ${mission.title}`} title={STAGE_COPY.simulation.title} description={mission.challenge} /><SafetyNotice />
    {current ? <><LearningCallout tone="question" title="먼저 생각해 볼까요?" role="note"><p>{STAGE_COPY.simulation.nextAction}</p></LearningCallout><article className="simulation-current"><h3>{currentIndex + 1}단계 · {ACTIONS[current.actionId].name}</h3>{targetMaterialId && <PredictionPrompt step={current} targetMaterialId={targetMaterialId} candidatePorts={candidatePorts[current.actionId]} selectedPort={selectedPrediction} onSelect={(port) => { setLocalPredictions((previous) => ({ ...previous, [current.id]: port })); dispatch({ type: 'record-prediction', stepId: current.id, port }); }} />}<PrimaryAction type="button" attention={attentionActionId === 'predict-next-step'} disabled={!selectedPrediction} onClick={runCurrent}>{currentIndex + 1}단계 가상 실행</PrimaryAction></article></> : <><LearningCallout tone="success" title="현재 공정의 단계를 모두 실행했어요" role="status"><p>이 공정에서 만든 단계가 끝났어요. 이제 토큰이 남은 물질함을 살펴볼 차례예요.</p></LearningCallout><PrimaryAction type="button" attention={attentionActionId === 'inspect-quality'} onClick={() => { dispatch({ type: 'set-run', run: fullRun }); dispatch({ type: 'advance' }); }}>품질 검사로</PrimaryAction></>}
    <LiveRegion message={latestOutcome ? (phaseFor(latestOutcome) === 'moving' ? formatMovementPhaseMessage(latestOutcome.stepId.replace(/^step-/, ''), 'moving') : formatMovementAnnouncement(latestOutcome)) : ''} />
    {completedOutcomes.map((item) => { const step = plan.find((candidate) => candidate.id === item.stepId)!; const prediction = predictions[item.stepId]; const target = getPredictionTargetMaterialId(fullRun, step, selectedTargetIds); const check = prediction && target ? evaluatePrediction(item, target, prediction) : null; const actual = item.outputs.map((output) => output.port); const phase = phaseFor(item); const stepNumber = item.stepId.replace(/^step-/, ''); return <div className="simulation-preview" key={`scene-${item.stepId}`}><p data-testid={`movement-phase-${item.stepId}`} className="movement-phase">{formatMovementPhaseMessage(stepNumber, phase)}</p><MovementScene outcome={item} beforeTokenIds={inputIds(fullRun, step)} reducedMotion={reducedMotion} phase={phase} onPhaseChange={(nextPhase) => setMovementPhases((previous) => previous[item.stepId] === nextPhase ? previous : { ...previous, [item.stepId]: nextPhase })} /><TokenStatusTable outcome={item} /><p>나의 예측: {prediction ? outputPortLabel(prediction) : '기록 없음'} · 실제 출력: {actual.map((port) => outputPortLabel(port)).join(', ')}</p><p>{check?.matched ? '예측이 목표 물질의 실제 출력과 일치했습니다.' : '예측과 실제 출력을 비교해 보세요.'}</p>{item.status === 'no-basis' && <p className="action-card-warning">이 조건에서는 분리 근거가 없음. 입력과 변화 없음 출력을 비교해 보세요.</p>}</div>; })}
    {completedOutcomes.length > 0 && <section><h3>완료한 단계</h3>{completedOutcomes.map((item) => <details key={item.stepId}><summary>{(plan.findIndex((step) => step.id === item.stepId) + 1)}단계 실행 결과</summary><p>{item.explanation}</p><p className="preview-arrow">↓ 다음 단계 입력은 직전 출력입니다.</p></details>)}</section>}
  </section>;
}
