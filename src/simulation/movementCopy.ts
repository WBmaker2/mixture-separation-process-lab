import { MATERIALS } from '../domain/materials';
import { outputPortLabel, streamLocationLabel } from '../domain/displayLabels';
import type { MaterialId } from '../domain/contracts';
import type { ProcessOutcome } from './contracts';

export type MovementPhase = 'moving' | 'complete';
export interface MovementGroup { materialId: MaterialId; fromStreamId: string; toStreamId: string | 'loss'; reason: string; count: number; }

export function groupMovements(outcome: ProcessOutcome): readonly MovementGroup[] {
  const groups = new Map<string, MovementGroup>();
  for (const movement of outcome.movements) {
    const materialId = outcome.tokens[movement.tokenId]?.materialId;
    if (!materialId) continue;
    const key = `${materialId}|${movement.fromStreamId}|${movement.toStreamId}|${movement.reason}`;
    const current = groups.get(key);
    if (current) current.count += 1;
    else groups.set(key, { materialId, fromStreamId: movement.fromStreamId, toStreamId: movement.toStreamId, reason: movement.reason, count: 1 });
  }
  return [...groups.values()];
}

function destinationParticle(toStreamId: string | 'loss'): string {
  if (toStreamId === 'loss') return '교육용 손실로';
  const port = toStreamId.split(':').at(-1) ?? '';
  const particles: Record<string, string> = { retained: '잔류로', pass: '통과로', filtrate: '거른 액체로', 'filter-residue': '거름 찌꺼기로', upper: '위층으로', lower: '아래층으로', mixture: '섞인 물질함으로', 'layered-mixture': '층이 생긴 물질함으로', 'vapor-model': '수증기 모형으로', 'solid-residue': '고체 잔류로', unchanged: '변화 없음으로' };
  return particles[port] ?? `${outputPortLabel(port as never)}으로`;
}

function reasonSentence(material: string, reason: string): string {
  const reasons: Record<string, string> = {
    'particle-size': `${material}의 알갱이 크기 차이로 나뉘었습니다.`,
    layer: `${material}이 액체 층의 위치에 따라 나뉘었습니다.`,
    'filter-behavior': `${material}의 거름 행동에 따라 이동했습니다.`,
    evaporate: `${material}의 가상 증발 변화를 나타냅니다.`,
    'educational-loss': '실제 수율이 아닌 교육용 손실로 기록했습니다.',
    preparation: `${material}의 상태를 다음 단계에 맞게 준비했습니다.`,
  };
  return reasons[reason] ?? '이동 이유를 교육용 정보로 표시합니다.';
}

export function formatMovementGroupExplanation(group: MovementGroup): string {
  const material = MATERIALS[group.materialId]?.name ?? '물질';
  return `${material} 토큰 ${group.count}개가 ${streamLocationLabel(group.fromStreamId)}에서 ${destinationParticle(group.toStreamId)} 이동했습니다. ${reasonSentence(material, group.reason)}`;
}

export function formatMovementAnnouncement(outcome: ProcessOutcome): string {
  const groups = groupMovements(outcome);
  const step = outcome.stepId.replace(/^step-/, '');
  if (!groups.length) return `${step}단계 실행: 이동한 토큰이 없고 변화 없음 출력입니다.`;
  const phrases = groups.map((group) => {
    const material = MATERIALS[group.materialId]?.name ?? '물질';
    return `${material} 토큰 ${group.count}개가 ${destinationParticle(group.toStreamId)} 이동했습니다`;
  });
  const joined = phrases.length === 1 ? phrases[0] : phrases.length === 2 ? phrases.join(' 그리고 ') : `${phrases.slice(0, -1).join(', ')} 그리고 ${phrases.at(-1)}`;
  return `${step}단계 실행: ${joined}.`;
}

export function formatMovementPhaseMessage(stepNumber: string, phase: MovementPhase): string {
  return phase === 'moving' ? `${stepNumber}단계 토큰이 이동하고 있습니다.` : `${stepNumber}단계 토큰 이동이 끝났습니다.`;
}
