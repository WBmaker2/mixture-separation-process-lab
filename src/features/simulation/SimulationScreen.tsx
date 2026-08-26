import { useState, type Dispatch } from 'react';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import type { MissionDefinition, OutputPortId, ProcessStep } from '../../domain/contracts';
import type { ProcessOutcome, SimulationRun } from '../../simulation/contracts';
import { ACTIONS } from '../../domain/actions';
import { SafetyNotice } from '../../components/SafetyNotice';
import { LiveRegion } from '../../components/LiveRegion';
import { TokenStatusTable } from '../../components/TokenStatusTable';
import { PredictionPrompt } from './PredictionPrompt';
import { MovementScene } from './MovementScene';

const candidatePorts: Record<ProcessStep['actionId'], readonly OutputPortId[]> = {
  sieve: ['pass', 'retained'], 'wait-for-layers': ['layered-mixture', 'unchanged'], 'layer-separation': ['upper', 'lower'], 'add-water': ['mixture', 'unchanged'], filtration: ['filtrate', 'filter-residue'], 'virtual-evaporation': ['vapor-model', 'solid-residue'],
};
const portName: Record<string, string> = { pass: '통과', retained: '잔류', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', unchanged: '변화 없음' };
export function formatMovementAnnouncement(outcome: ProcessOutcome): string {
  const counts = new Map<string, number>(); outcome.movements.forEach((m) => { if (m.toStreamId !== 'loss') counts.set(m.toStreamId, (counts.get(m.toStreamId) ?? 0) + 1); });
  const parts = [...counts].map(([destination, count]) => `${count}개 토큰이 ${portName[destination.split(':').at(-1) ?? destination] ?? destination}로 이동`);
  return `${outcome.stepId.replace('step-', '')}단계 실행: ${parts.join(' 그리고 ')}${outcome.lostTokenIds.length ? `, ${outcome.lostTokenIds.length}개 토큰이 교육용 손실로 기록되었습니다` : ''}.`;
}
function inputIds(run: SimulationRun, step: ProcessStep): readonly string[] { const streamId = step.input.source === 'initial' ? 'initial' : `${step.input.stepId}:${step.input.port}`; return run.streams[streamId]?.tokenIds ?? []; }

export interface SimulationScreenProps { mission: MissionDefinition; plan: readonly ProcessStep[]; fullRun: SimulationRun; completedStepIds: readonly string[]; predictions: Readonly<Record<string, OutputPortId>>; attentionActionId: AttentionActionId | null; reducedMotion: boolean; dispatch: Dispatch<LabAction>; }
export function SimulationScreen({ mission, plan, fullRun, completedStepIds, predictions, attentionActionId, reducedMotion, dispatch }: SimulationScreenProps) {
  const currentIndex = plan.findIndex((step) => !completedStepIds.includes(step.id));
  const current = currentIndex >= 0 ? plan[currentIndex] : null;
  const outcome = current ? fullRun.outcomes.find((item) => item.stepId === current.id) : null;
  const completedOutcomes = fullRun.outcomes.filter((item) => completedStepIds.includes(item.stepId));
  const [localPrediction, setLocalPrediction] = useState<OutputPortId | undefined>(undefined);
  const selectedPrediction = current ? predictions[current.id] ?? localPrediction : undefined;
  const runCurrent = () => { if (!current || !selectedPrediction || !outcome) return; dispatch({ type: 'record-step-complete', stepId: current.id }); if (completedStepIds.length + 1 >= plan.length) dispatch({ type: 'set-run', run: fullRun }); };
  return <section className="screen simulation-screen"><SafetyNotice /><header className="hero-copy"><p className="eyebrow">{mission.title}</p><h2>예측하고 가상 실행하기</h2><p>{mission.challenge}</p></header>
    {current ? <article className="simulation-current"><h3>{currentIndex + 1}단계 · {ACTIONS[current.actionId].name}</h3><PredictionPrompt step={current} candidatePorts={candidatePorts[current.actionId]} selectedPort={selectedPrediction} onSelect={(port) => { setLocalPrediction(port); dispatch({ type: 'record-prediction', stepId: current.id, port }); }} /><button type="button" data-attention="true" className={`primary-action ${attentionActionId === 'predict-next-step' && !selectedPrediction ? 'gi-pulse' : ''}`} disabled={!selectedPrediction} onClick={runCurrent}>{currentIndex + 1}단계 가상 실행</button></article> : <><p>모든 단계의 실행이 끝났습니다.</p><button type="button" className="primary-action" onClick={() => dispatch({ type: 'set-run', run: fullRun })}>품질 검사로</button></>}
    {outcome && <div className="simulation-preview"><TokenStatusTable outcome={outcome} /></div>}
    {completedOutcomes.map((item) => <div className="simulation-preview" key={`scene-${item.stepId}`}><LiveRegion message={formatMovementAnnouncement(item)} /><MovementScene outcome={item} beforeTokenIds={inputIds(fullRun, plan.find((step) => step.id === item.stepId)!)} reducedMotion={reducedMotion} />{item.status === 'no-basis' && <p className="action-card-warning">이 조건에서는 분리 근거가 없음. 입력과 unchanged 출력을 비교해 보세요.</p>}</div>)}
    {completedOutcomes.length > 0 && <section><h3>완료한 단계</h3>{completedOutcomes.map((item) => <details key={item.stepId}><summary>{item.stepId} 실행 결과</summary><p>{item.explanation}</p><p className="preview-arrow">↓ 다음 단계 입력은 직전 출력입니다.</p></details>)}</section>}
  </section>;
}
