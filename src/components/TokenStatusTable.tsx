import { MATERIALS } from '../domain/materials';
import type { MaterialId } from '../domain/contracts';
import type { ProcessOutcome } from '../simulation/contracts';

export function TokenStatusTable({ outcome }: { outcome: ProcessOutcome }) {
  const before = new Map<string, number>();
  const after = new Map<string, number>();
  outcome.movements.forEach((movement) => {
    const material = outcome.tokens[movement.tokenId]?.materialId;
    if (!material) return;
    before.set(`${material}:${movement.fromStreamId}`, (before.get(`${material}:${movement.fromStreamId}`) ?? 0) + 1);
    after.set(`${material}:${movement.toStreamId}`, (after.get(`${material}:${movement.toStreamId}`) ?? 0) + 1);
  });
  const materials = [...new Set(Object.values(outcome.tokens).filter((token) => outcome.movements.some((m) => m.tokenId === token.id)).map((token) => token.materialId))];
  return <table aria-label="단계별 물질 토큰 상태"><caption>단계별 물질 토큰 상태</caption><thead><tr><th>물질</th><th>전 위치</th><th>후 위치</th><th>토큰 변화</th><th>교육용 설명</th></tr></thead><tbody>
    {materials.map((id: MaterialId) => {
      const moved = outcome.movements.filter((m) => outcome.tokens[m.tokenId]?.materialId === id);
      const destination = moved[0]?.toStreamId ?? 'unchanged';
      const from = moved[0]?.fromStreamId ?? '입력 물질함';
      const count = moved.filter((m) => m.toStreamId === destination).length;
      return <tr key={id}><th scope="row">{MATERIALS[id].name}</th><td>{from}</td><td>{destination}</td><td>{count}개 토큰</td><td>{outcome.explanation}</td></tr>;
    })}
  </tbody></table>;
}
