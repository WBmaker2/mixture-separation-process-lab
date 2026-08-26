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
  sieve: ['pass', 'retained', 'unchanged'], 'wait-for-layers': ['layered-mixture', 'unchanged'], 'layer-separation': ['upper', 'lower', 'unchanged'], 'add-water': ['mixture', 'unchanged'], filtration: ['filtrate', 'filter-residue', 'unchanged'], 'virtual-evaporation': ['vapor-model', 'solid-residue', 'unchanged'],
};
const portName: Record<string, string> = { pass: '통과', retained: '잔류', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', unchanged: '변화 없음' };
export function formatMovementAnnouncement(outcome: ProcessOutcome): string {
  const names: Record<string, string> = { gravel: '큰 자갈', sand: '고운 모래', salt: '소금', water: '물', oil: '식용유 모형' };
  const counts = new Map<string, number>(); outcome.movements.forEach((m) => { const material = outcome.tokens[m.tokenId]?.materialId; if (material) counts.set(`${material}|${m.toStreamId}`, (counts.get(`${material}|${m.toStreamId}`) ?? 0) + 1); });
  if (!counts.size) return `${outcome.stepId.replace('step-', '')}단계 실행: 이동한 토큰이 없고 변화 없음(unchanged) 출력입니다.`;
  const parts = [...counts].map(([key, count]) => { const [material, destination] = key.split('|'); return `${names[material] ?? material} 토큰 ${count}개가 ${destination === 'loss' ? '교육용 손실' : portName[destination.split(':').at(-1) ?? destination] ?? '변화 없음'}으로 이동`; });
  return `${outcome.stepId.replace('step-', '')}단계 실행: ${parts.join(' 그리고 ')}.`;
}
function inputIds(run: SimulationRun, step: ProcessStep): readonly string[] { const streamId = step.input.source === 'initial' ? 'initial' : `${step.input.stepId}:${step.input.port}`; return run.streams[streamId]?.tokenIds ?? []; }

export interface SimulationScreenProps { mission: MissionDefinition; plan: readonly ProcessStep[]; fullRun: SimulationRun; completedStepIds: readonly string[]; predictions: Readonly<Record<string, OutputPortId>>; attentionActionId: AttentionActionId | null; reducedMotion: boolean; dispatch: Dispatch<LabAction>; }
export function SimulationScreen({ mission, plan, fullRun, completedStepIds, predictions, attentionActionId, reducedMotion, dispatch }: SimulationScreenProps) {
  const currentIndex = plan.findIndex((step) => !completedStepIds.includes(step.id));
  const current = currentIndex >= 0 ? plan[currentIndex] : null;
  const outcome = current ? fullRun.outcomes.find((item) => item.stepId === current.id) : null;
  const completedOutcomes = fullRun.outcomes.filter((item) => completedStepIds.includes(item.stepId));
  const [localPredictions, setLocalPredictions] = useState<Readonly<Record<string, OutputPortId>>>({});
  const selectedPrediction = current ? predictions[current.id] ?? localPredictions[current.id] : undefined;
  const runCurrent = () => { if (!current || !selectedPrediction || !outcome) return; dispatch({ type: 'record-step-complete', stepId: current.id }); if (completedStepIds.length + 1 >= plan.length) dispatch({ type: 'set-run', run: fullRun }); };
  return <section className="screen simulation-screen"><SafetyNotice /><header className="hero-copy"><p className="eyebrow">{mission.title}</p><h2>예측하고 가상 실행하기</h2><p>{mission.challenge}</p></header>
    {current ? <article className="simulation-current"><h3>{currentIndex + 1}단계 · {ACTIONS[current.actionId].name}</h3><PredictionPrompt step={current} candidatePorts={candidatePorts[current.actionId]} selectedPort={selectedPrediction} onSelect={(port) => { setLocalPredictions((previous) => ({ ...previous, [current.id]: port })); dispatch({ type: 'record-prediction', stepId: current.id, port }); }} /><button type="button" data-attention="true" className={`primary-action ${attentionActionId === 'predict-next-step' && !selectedPrediction ? 'gi-pulse' : ''}`} disabled={!selectedPrediction} onClick={runCurrent}>{currentIndex + 1}단계 가상 실행</button></article> : <><p>모든 단계의 실행이 끝났습니다.</p><button type="button" className="primary-action" onClick={() => { dispatch({ type: 'set-run', run: fullRun }); dispatch({ type: 'advance' }); }}>품질 검사로</button></>}
    {completedOutcomes.map((item) => { const step = plan.find((candidate) => candidate.id === item.stepId)!; const prediction = predictions[item.stepId]; const actual = item.outputs.map((output) => output.port); return <div className="simulation-preview" key={`scene-${item.stepId}`}><LiveRegion message={formatMovementAnnouncement(item)} /><MovementScene outcome={item} beforeTokenIds={inputIds(fullRun, step)} reducedMotion={reducedMotion} /><TokenStatusTable outcome={item} /><p>나의 예측: {prediction ? portName[prediction] : '기록 없음'} · 실제 출력: {actual.map((port) => portName[port]).join(', ')}</p><p>{prediction && actual.includes(prediction) ? '예측이 실제 출력과 일치했습니다.' : '예측과 실제 출력을 비교해 보세요.'}</p>{item.status === 'no-basis' && <p className="action-card-warning">이 조건에서는 분리 근거가 없음. 입력과 unchanged 출력을 비교해 보세요.</p>}</div>; })}
    {completedOutcomes.length > 0 && <section><h3>완료한 단계</h3>{completedOutcomes.map((item) => <details key={item.stepId}><summary>{item.stepId} 실행 결과</summary><p>{item.explanation}</p><p className="preview-arrow">↓ 다음 단계 입력은 직전 출력입니다.</p></details>)}</section>}
  </section>;
}
