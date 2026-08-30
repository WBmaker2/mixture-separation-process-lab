import type { Dispatch } from 'react';
import { ACTIONS } from '../../domain/actions';
import { MISSIONS } from '../../domain/missions';
import { PROPERTIES } from '../../domain/properties';
import type { MissionId, PropertyId } from '../../domain/contracts';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import { PrimaryAction } from '../../components/PrimaryAction';
import { SafetyNotice } from '../../components/SafetyNotice';
import { PropertyTable } from './PropertyTable';
import { StageHeader } from '../../components/StageHeader';
import { LearningCallout } from '../../components/LearningCallout';
import { STAGE_COPY } from '../../content/learningCopy';

export interface PropertyLabScreenProps { missionId: MissionId; confirmedPropertyIds: readonly PropertyId[]; attentionActionId: AttentionActionId | null; dispatch: Dispatch<LabAction>; }

export function PropertyLabScreen({ missionId, confirmedPropertyIds, attentionActionId, dispatch }: PropertyLabScreenProps) {
  const mission = MISSIONS[missionId];
  const ready = mission.requiredPropertyIds.every((id) => confirmedPropertyIds.includes(id));
  return <section className="screen property-screen" aria-labelledby="stage-title"><StageHeader eyebrow={STAGE_COPY.properties.eyebrow} title="성질 분석실" description={STAGE_COPY.properties.description} />
    <PropertyTable materialIds={mission.initialMaterials} />
    <LearningCallout tone="hint" title="관찰한 성질이 행동의 문을 열어요"><p>아래 성질에 체크하면 알맞은 준비 행동과 분리 방법을 살펴볼 수 있어요.</p></LearningCallout>
    <fieldset className="property-checks"><legend>필수 성질을 확인하세요</legend>{mission.requiredPropertyIds.map((id) => <label key={id}><input type="checkbox" checked={confirmedPropertyIds.includes(id)} onChange={() => dispatch({ type: 'toggle-property', propertyId: id })} /><span><strong>{PROPERTIES[id].name}</strong><small>{PROPERTIES[id].question}</small></span></label>)}</fieldset>
    <div className="action-cards">{mission.allowedActionIds.map((actionId) => { const action = ACTIONS[actionId]; return <article className="action-card" key={action.id}><span className="action-kind">{action.kind === 'method' ? '분리 방법' : '준비 행동'}</span><h3>{action.name}</h3><p><strong>필요 성질:</strong> {action.requiredPropertyIds.map((p) => PROPERTIES[p].name).join(', ')}</p><p><strong>적용 조건:</strong> {action.applicableWhen}</p><p><strong>출력:</strong> {action.outputLabels.join(' / ')}</p><p><strong>회수·잔류:</strong> {action.recoveredAndRemaining}</p><p><strong>모델 한계:</strong> {action.modelLimit}</p><p><strong>안전:</strong> {action.safetyNote}</p><p className="action-card-status" role="status">공정 설계판에서 방법을 선택할 수 있어요.</p></article>; })}</div>
    <PrimaryAction type="button" attention={ready && (attentionActionId === null || attentionActionId === 'confirm-properties')} disabled={!ready} onClick={() => dispatch({ type: 'advance' })}>공정 설계판으로</PrimaryAction><SafetyNotice /></section>;
}
