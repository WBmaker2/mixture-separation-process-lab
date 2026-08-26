import { MATERIALS } from '../domain/materials';
import type { MaterialId } from '../domain/contracts';
import type { ProcessOutcome } from '../simulation/contracts';

export function TokenStatusTable({ outcome }: { outcome: ProcessOutcome }) {
  const groups = new Map<string, { material: MaterialId; from: string; to: string; count: number }>();
  outcome.movements.forEach((movement) => {
    const material = outcome.tokens[movement.tokenId]?.materialId;
    if (!material) return;
    const key = `${material}|${movement.fromStreamId}|${movement.toStreamId}`;
    const current = groups.get(key) ?? { material, from: movement.fromStreamId, to: movement.toStreamId, count: 0 };
    current.count += 1; groups.set(key, current);
  });
  const label = (location: string) => { if (location === 'initial') return '처음 혼합물'; if (location === 'loss') return '교육용 손실'; const [step, port] = location.split(':'); const names: Record<string, string> = { pass: '통과 물질', retained: '잔류 물질', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', unchanged: '변화 없음' }; return `${step.replace('step-', '')}단계의 ${names[port] ?? '출력'}`; };
  return <table aria-label="단계별 물질 토큰 상태"><caption>단계별 물질 토큰 상태</caption><thead><tr><th scope="col">물질</th><th scope="col">전 위치</th><th scope="col">후 위치</th><th scope="col">토큰 변화</th><th scope="col">교육용 설명</th></tr></thead><tbody>
    {[...groups.values()].map((group) => <tr key={`${group.material}-${group.from}-${group.to}`}><th scope="row">{MATERIALS[group.material].name}</th><td>{label(group.from)}</td><td>{label(group.to)}</td><td>{group.count}개 토큰 이동</td><td>{outcome.explanation}</td></tr>)}
    {groups.size === 0 && <tr><th scope="row">전체</th><td>입력 물질함</td><td>변화 없음</td><td>이동한 토큰 0개</td><td>{outcome.explanation}</td></tr>}
  </tbody></table>;
}
