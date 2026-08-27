import type { Dispatch } from 'react';
import { MATERIALS } from '../../domain/materials';
import type { MaterialId, MissionDefinition, RecoveryClaim } from '../../domain/contracts';
import type { SimulationRun } from '../../simulation/contracts';
import type { LabAction } from '../../state/contracts';

export interface RecoveryClaimPanelProps { mission: MissionDefinition; run: SimulationRun; claims: readonly RecoveryClaim[]; targetIds?: readonly MaterialId[]; dispatch: Dispatch<LabAction>; }
const portNames: Record<string, string> = { retained: '잔류', pass: '통과', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', 'solid-residue': '고체 잔류', 'vapor-model': '수증기 모형', mixture: '섞인 물질함', unchanged: '변화 없음', upper: '위층', lower: '아래층', 'layered-mixture': '층이 생긴 물질함' };
function streamLabel(id: string, run: SimulationRun) {
  if (id === 'initial') return '처음 혼합물';
  const [step, port] = id.split(':');
  const stream = run.streams[id]; const counts = new Map<string, number>();
  (stream?.tokenIds ?? []).forEach((tokenId) => { const material = run.tokens[tokenId]?.materialId; if (material) counts.set(material, (counts.get(material) ?? 0) + 1); });
  const contents = [...counts].map(([material, count]) => `${MATERIALS[material as MaterialId].name} ${count}개`).join(', ') || '토큰 없음';
  return `${step.replace('step-', '')}단계 ${portNames[port] ?? port}: ${contents}`;
}
export function RecoveryClaimPanel({ mission, run, claims, targetIds, dispatch }: RecoveryClaimPanelProps) {
  const allowed = mission.goal.mode === 'all-components' ? mission.goal.requiredTargets : mission.goal.selectableTargets;
  const targets = (targetIds ?? allowed).filter((id, index, ids) => allowed.includes(id) && ids.indexOf(id) === index);
  return <section aria-labelledby="claim-title" className="recovery-claims"><h3 id="claim-title">목표 물질이 남은 물질함을 고르세요</h3>
    {targets.map((materialId) => { const current = claims.find((claim) => claim.materialId === materialId)?.streamId ?? ''; const options = ['', ...run.activeLeafStreamIds]; return <label key={materialId} htmlFor={`claim-${materialId}`}>{MATERIALS[materialId].name} 회수 물질함<select id={`claim-${materialId}`} value={current} onChange={(event) => dispatch({ type: 'set-recovery-claim', claim: { materialId, streamId: event.target.value } })} onKeyDown={(event) => { if (event.key !== 'ArrowDown') return; event.preventDefault(); const next = options[(Math.max(0, options.indexOf(current)) + 1) % options.length]; dispatch({ type: 'set-recovery-claim', claim: { materialId, streamId: next } }); }}><option value="">회수 물질함을 고르세요</option>{run.activeLeafStreamIds.map((id) => <option key={id} value={id}>{streamLabel(id, run)}</option>)}</select></label>; })}
  </section>;
}
