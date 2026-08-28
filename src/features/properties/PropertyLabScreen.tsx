import type { Dispatch } from 'react';
import { ACTIONS } from '../../domain/actions';
import { MISSIONS } from '../../domain/missions';
import { PROPERTIES } from '../../domain/properties';
import type { MissionId, PropertyId } from '../../domain/contracts';
import type { AttentionActionId, LabAction } from '../../state/contracts';
import { PrimaryAction } from '../../components/PrimaryAction';
import { SafetyNotice } from '../../components/SafetyNotice';
import { PropertyTable } from './PropertyTable';

export interface PropertyLabScreenProps { missionId: MissionId; confirmedPropertyIds: readonly PropertyId[]; attentionActionId: AttentionActionId | null; dispatch: Dispatch<LabAction>; }

export function PropertyLabScreen({ missionId, confirmedPropertyIds, attentionActionId, dispatch }: PropertyLabScreenProps) {
  const mission = MISSIONS[missionId];
  const ready = mission.requiredPropertyIds.every((id) => confirmedPropertyIds.includes(id));
  return <section className="screen property-screen" aria-labelledby="property-title"><div className="hero-copy"><p className="eyebrow">두 번째 단계</p><h2 id="property-title">성질 분석실</h2><p>관찰한 성질에 체크하고, 어떤 방법이 가능한지 살펴보세요.</p></div>
    <PropertyTable materialIds={mission.initialMaterials} />
    <fieldset className="property-checks"><legend>필수 성질을 확인하세요</legend>{mission.requiredPropertyIds.map((id) => <label key={id}><input type="checkbox" checked={confirmedPropertyIds.includes(id)} onChange={() => dispatch({ type: 'toggle-property', propertyId: id })} /> {PROPERTIES[id].name}<small>{PROPERTIES[id].question}</small></label>)}</fieldset>
    <div className="action-cards">{mission.allowedActionIds.map((actionId) => { const action = ACTIONS[actionId]; return <article className="action-card" key={action.id}><h3>{action.name}</h3><p><strong>필요 성질:</strong> {action.requiredPropertyIds.map((p) => PROPERTIES[p].name).join(', ')}</p><p><strong>적용 조건:</strong> {action.applicableWhen}</p><p><strong>출력:</strong> {action.outputLabels.join(' / ')}</p><p><strong>회수·잔류:</strong> {action.recoveredAndRemaining}</p><p><strong>모델 한계:</strong> {action.modelLimit}</p><p><strong>안전:</strong> {action.safetyNote}</p><p className="action-card-status" role="status">공정 설계판에서 방법을 선택할 수 있어요.</p></article>; })}</div>
    <PrimaryAction type="button" attention={ready && (attentionActionId === null || attentionActionId === 'confirm-properties')} disabled={!ready} onClick={() => dispatch({ type: 'advance' })}>공정 설계판으로</PrimaryAction><SafetyNotice /></section>;
}
