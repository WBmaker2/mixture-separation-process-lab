import type { Dispatch } from 'react';
import { MISSION_IDS, MISSIONS, missionTargetsReady } from '../../domain/missions';
import type { LabAction, AttentionActionId } from '../../state/contracts';
import type { MissionId, MaterialId } from '../../domain/contracts';
import { PrimaryAction } from '../../components/PrimaryAction';
import { MaterialTokenView } from '../../components/MaterialTokenView';
import { SafetyNotice } from '../../components/SafetyNotice';

export interface IntakeScreenProps { missionId: MissionId | null; selectedTargetIds: readonly MaterialId[]; attentionActionId: AttentionActionId | null; dispatch: Dispatch<LabAction>; }

export function IntakeScreen({ missionId, selectedTargetIds, attentionActionId, dispatch }: IntakeScreenProps) {
  const mission = missionId ? MISSIONS[missionId] : null;
  const targetsReady = missionTargetsReady(missionId, selectedTargetIds);
  return <section className="screen intake-screen" aria-labelledby="intake-title">
    <div className="hero-copy"><p className="eyebrow">첫 번째 단계</p><h2 id="intake-title">미션을 고르고 목표를 정해요</h2><p>실제 실험을 대체하지 않는 가상 공정 시뮬레이션입니다.</p><p>화면 결과는 교육용 토큰이며 실제 순도나 수율을 보장하지 않습니다.</p><p>실제 실험 결과는 재료·양·기구에 따라 달라질 수 있습니다.</p></div>
    <fieldset><legend>미션을 선택하세요</legend><div className="mission-grid">{MISSION_IDS.map((id) => <label className="choice-card" key={id}><input type="radio" name="mission" value={id} checked={missionId === id} onChange={() => dispatch({ type: 'select-mission', missionId: id })} /> <span><strong>{MISSIONS[id].title}</strong><small>{MISSIONS[id].mixtureLabel}</small></span></label>)}</div></fieldset>
    {mission && <div className="target-panel"><h3>회수할 목표 물질</h3><p>{mission.challenge}</p>{mission.goal.mode === 'all-components' ? <div className="token-list" aria-label="통합 공정 필수 목표">{mission.goal.requiredTargets.map((id) => <MaterialTokenView key={id} materialId={id} count={10} />)}</div> : <fieldset><legend>목표 물질 하나를 선택하세요</legend>{mission.goal.selectableTargets.map((id) => <label className="target-choice" key={id}><input type="radio" name="target" checked={selectedTargetIds.includes(id)} onChange={() => dispatch({ type: 'set-targets', materialIds: [id] })} /><MaterialTokenView materialId={id} /></label>)}</fieldset>}
      <PrimaryAction type="button" attention={targetsReady && (attentionActionId === 'select-target' || attentionActionId === null)} disabled={!targetsReady} onClick={() => dispatch({ type: 'advance' })}>성질 분석실로</PrimaryAction>
    </div>}
    <SafetyNotice />
  </section>;
}
