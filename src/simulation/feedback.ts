import type { MaterialId } from '../domain/contracts';
import { MATERIALS } from '../domain/materials';
import type { RunEvaluation, SimulationRun } from './contracts';

export function getGuidingQuestion(evaluation: RunEvaluation, run: SimulationRun, targetIds: readonly MaterialId[] = []): string {
  const targets = [...new Set(targetIds)].filter((id) => Boolean(MATERIALS[id]));
  const targetCounts = (ids: readonly MaterialId[]) => ids.map((id) => ({ id, count: run.activeLeafStreamIds.reduce((sum, streamId) => sum + (run.streams[streamId]?.tokenIds ?? []).filter((tokenId) => run.tokens[tokenId]?.materialId === id).length, 0) }));
  const lostCounts = targets.map((id) => ({ id, count: run.lostTokenIds.filter((tokenId) => run.tokens[tokenId]?.materialId === id).length }));
  const candidates = lostCounts.some(({ count }) => count > 0) ? lostCounts.filter(({ count }) => count > 0) : targetCounts(targets);
  const minimum = candidates.length ? Math.min(...candidates.map(({ count }) => count)) : 0;
  const focusIds = candidates.filter(({ count }) => count === minimum).map(({ id }) => id);
  const focusNames = (focusIds.length ? focusIds : targets).map((id) => MATERIALS[id].name);
  const targetName = focusNames.join(' · ') || '목표 물질';
  const subject = focusNames.length === 1 ? `${targetName}${/[가-힣]$/.test(targetName) && (targetName.charCodeAt(targetName.length - 1) - 0xac00) % 28 > 0 ? '은' : '는'}` : `${targetName}은`;
  const codes = evaluation.issueCodes;
  if (codes.includes('property-not-confirmed') || codes.includes('invalid-evidence') || codes.includes('missing-required-property')) return '이 방법은 어떤 성질(물질의 성질)을 이용하나요?';
  if (codes.includes('future-input-reference') || codes.includes('input-not-found') || codes.includes('input-already-consumed')) return '바로 앞 단계의 물질함에는 무엇이 남아 있나요?';
  if (codes.includes('no-basis-step')) return '이 단계의 두 물질 사이에는 이용할 수 있는 성질 차이가 있나요?';
  if (codes.includes('almost-no-recovery') || run.lostTokenIds.length > 0) return `이 단계 뒤에 ${subject} 어느 쪽에 있나요?`;
  if (codes.includes('too-much-contamination')) return '회수한 물질함에 다른 물질 토큰이 몇 개 섞여 있나요?';
  if (codes.includes('missing-claim')) return `${subject} 남아 있는 마지막 물질함은 어디인가요?`;
  return evaluation.accepted ? '어떤 성질을 이용해 이 공정 순서를 설명할 수 있나요?' : `${subject} 남아 있는 마지막 물질함은 어디인가요?`;
}
