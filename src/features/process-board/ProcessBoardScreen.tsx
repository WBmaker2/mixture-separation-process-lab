import { useMemo, useState } from 'react';
import type { Dispatch } from 'react';
import { ACTIONS } from '../../domain/actions';
import { MISSIONS } from '../../domain/missions';
import { PROPERTIES } from '../../domain/properties';
import type { MissionId, OutputPortId, ProcessActionId, ProcessStep, PropertyId, StreamRef, SieveGap } from '../../domain/contracts';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import { validatePlan } from '../../simulation/runProcess';
import { ActionCard, getExpectedPorts } from './ActionCard';
import { ProcessSlot } from './ProcessSlot';
import { ProcessPreview } from './ProcessPreview';

export interface ProcessBoardScreenProps { missionId: MissionId; confirmedPropertyIds: readonly PropertyId[]; plan: readonly ProcessStep[]; initialPlan: readonly ProcessStep[] | null; revisionReason?: string; showRevisionReason?: boolean; planHistoryDepth: number; attentionActionId: AttentionActionId | null; dispatch: Dispatch<LabAction>; }
const portLabels: Record<string, string> = { pass: '통과 물질', retained: '잔류 물질', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함' };
const actionIds = Object.keys(ACTIONS) as ProcessActionId[];
const inputStepId = (input: StreamRef) => input.source === 'step' ? input.stepId : null;
const brokenReference = (input: StreamRef, consumerIndex: number, plan: readonly ProcessStep[]) => { const id = inputStepId(input); if (!id) return false; const referencedIndex = plan.findIndex((step) => step.id === id); return referencedIndex < 0 || referencedIndex >= consumerIndex; };
const nextId = (plan: readonly ProcessStep[]) => `step-${Math.max(0, ...plan.map((x) => Number(x.id.replace('step-', '')) || 0)) + 1}`;
function evidenceFor(id: ProcessActionId): PropertyId { return ACTIONS[id].requiredPropertyIds[0]; }
function makeStep(id: string, actionId: ProcessActionId, input: StreamRef, gap: SieveGap): ProcessStep {
  const params = actionId === 'sieve' ? { gap } : {};
  return { id, actionId, input, evidencePropertyId: evidenceFor(actionId), params } as ProcessStep;
}
export function ProcessBoardScreen({ missionId, confirmedPropertyIds, plan, initialPlan, revisionReason = '', showRevisionReason = false, planHistoryDepth, attentionActionId, dispatch }: ProcessBoardScreenProps) {
  const mission = MISSIONS[missionId];
  const [selected, setSelected] = useState<ProcessActionId | null>(null);
  const [gap, setGap] = useState<SieveGap>('wide-gap');
  const [inputPort, setInputPort] = useState<string>('');
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const replaceIndex = replaceId ? plan.findIndex((step) => step.id === replaceId) : -1;
  const targetIndex = replaceIndex >= 0 ? replaceIndex : plan.length;
  const validIssues = useMemo(() => validatePlan(mission, plan, confirmedPropertyIds), [mission, plan, confirmedPropertyIds]);
  const selectAction = (id: ProcessActionId) => { setSelected(id); setInputPort(replaceId ? inputPort : plan.length ? '' : 'initial'); };
  const addOrReplace = () => {
    if (!selected) return;
    const existing = replaceIndex >= 0 ? plan[replaceIndex] : null;
    const input: StreamRef = existing ? existing.input : inputPort === 'initial' || !plan.length ? { source: 'initial' } : (() => { const [stepId, port] = inputPort.split('|'); return { source: 'step', stepId, port: port as OutputPortId }; })();
    const step = makeStep(replaceId ?? nextId(plan), selected, input, gap);
    if (replaceId) dispatch({ type: 'replace-step', stepId: replaceId, replacement: step }); else dispatch({ type: 'add-step', step });
    setSelected(null); setReplaceId(null); setInputPort('');
  };
  const canAdd = Boolean(selected) && Boolean(inputPort) && (selected !== 'sieve' || Boolean(gap));
  return <section className="screen process-board-screen" aria-labelledby="design-title">
    <div className="hero-copy"><p className="eyebrow">세 번째 단계</p><h2 id="design-title">공정 설계판</h2><p>{mission.challenge}</p><p>방법을 고른 뒤 버튼으로 단계를 넣습니다. 실제 기구나 측정값을 나타내지 않는 화면 모형입니다.</p></div>
    {initialPlan && <aside className="revision-summary"><h3>최초 공정 요약</h3><p>{initialPlan.map((step, index) => `${index + 1}단계 ${ACTIONS[step.actionId].name}`).join(' → ')}</p><p>어느 단계를 바꾸면 결과가 달라질까요?</p></aside>}
    {showRevisionReason && initialPlan && <section className="revision-reason"><label htmlFor="revision-reason">공정을 바꾼 이유</label><textarea id="revision-reason" value={revisionReason} onChange={(event) => dispatch({ type: 'set-revision-reason', reason: event.target.value })} /><p>{revisionReason.trim().length < 10 ? '성질과 남은 물질을 포함해 10자 이상 적어 보세요.' : '수정 이유가 기록되었습니다.'}</p></section>}
    <section aria-labelledby="actions-title"><h3 id="actions-title">사용할 행동을 고르세요</h3><div className="action-cards">{actionIds.filter((id) => mission.allowedActionIds.includes(id)).map((id) => <ActionCard key={id} actionId={id} confirmedPropertyIds={confirmedPropertyIds} selected={selected === id} onSelect={() => selectAction(id)} />)}</div></section>
    {(() => { const missing = [...new Set(mission.allowedActionIds.flatMap((id) => ACTIONS[id].requiredPropertyIds).filter((id) => !confirmedPropertyIds.includes(id)))]; return missing.length > 0 ? <p role="alert" tabIndex={0} className="property-guidance">{missing.map((id) => PROPERTIES[id].name).join(', ')} 성질을 먼저 확인하세요. 확인하지 않은 성질이 필요한 행동은 선택할 수 없습니다.</p> : null; })()}
    {selected && <section className="step-config" aria-labelledby="config-title"><h3 id="config-title">{replaceId ? '바꿀 단계 설정' : `${plan.length + 1}단계 설정`}</h3>
      {selected === 'sieve' && <fieldset><legend>체 간격 범주</legend>{([['wide-gap', '넓은 간격'], ['medium-gap', '중간 간격'], ['fine-gap', '고운 간격']] as const).map(([value, label]) => <label key={value}><input type="radio" name="gap" checked={gap === value} onChange={() => setGap(value)} />{label}</label>)}</fieldset>}
      {targetIndex === 0 ? <p>첫 단계 입력: 처음 혼합물</p> : <fieldset><legend>입력 물질함을 고르세요</legend>{plan.slice(0, targetIndex).flatMap((prior, priorIndex) => getExpectedPorts(prior.actionId).map((port) => <label key={`${prior.id}|${port}`}><input type="radio" name="input-port" value={`${prior.id}|${port}`} checked={inputPort === `${prior.id}|${port}`} onChange={(e) => setInputPort(e.target.value)} />{targetIndex + 1}단계 입력: {priorIndex + 1}단계의 {portLabels[port]}</label>))}</fieldset>}
      <button type="button" disabled={!canAdd} onClick={addOrReplace}>{replaceId ? '교체하기' : `${plan.length + 1}단계에 넣기`}</button>
    </section>}
    <section aria-labelledby="slots-title"><h3 id="slots-title">현재 공정</h3><ol className="process-slots">{plan.map((step, index) => { const ref = step.input; const refValue = ref.source === 'initial' ? 'initial' : `${ref.stepId}|${ref.port}`; return <ProcessSlot key={step.id} step={step} index={index} total={plan.length} brokenInput={brokenReference(ref, index, plan)} onReplace={() => { setReplaceId(step.id); setSelected(step.actionId); setInputPort(refValue); }} onMove={(direction) => dispatch({ type: 'move-step', stepId: step.id, direction })} onRemove={() => dispatch({ type: 'remove-step', stepId: step.id })} />; })}</ol></section>
    <div className="plan-controls"><button type="button" disabled={planHistoryDepth === 0} onClick={() => dispatch({ type: 'undo-plan' })}>실행 취소</button><button type="button" disabled={!initialPlan} onClick={() => dispatch({ type: 'restore-initial-plan' })}>처음 공정으로 복원</button></div>
    <ProcessPreview plan={plan} />
    {validIssues.length > 0 && <p role="alert" tabIndex={0} className="plan-error">{validIssues[0].message}</p>}
    <button type="button" className={`primary-action${attentionActionId === 'prepare-simulation' && validIssues.length === 0 && plan.length > 0 ? ' gi-pulse' : ''}`} disabled={validIssues.length > 0 || plan.length === 0} onClick={() => dispatch({ type: 'start-simulation' })}>가상 실행 준비</button>
    <div className="property-hint">확인한 성질: {confirmedPropertyIds.map((id) => PROPERTIES[id].name).join(', ') || '없음'}</div>
  </section>;
}
