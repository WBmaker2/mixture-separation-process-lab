import { MATERIALS } from '../domain/materials';
import type { ProcessOutcome } from '../simulation/contracts';
import { formatMovementGroupExplanation, groupMovements } from '../simulation/movementCopy';
import { streamLocationLabel } from '../domain/displayLabels';

export function TokenStatusTable({ outcome }: { outcome: ProcessOutcome }) {
  const groups = groupMovements(outcome);
  return <div className="table-scroll" role="region" aria-label="단계별 물질 토큰 상태"><table aria-label="단계별 물질 토큰 상태"><caption>단계별 물질 토큰 상태</caption><thead><tr><th scope="col">물질</th><th scope="col">전 위치</th><th scope="col">후 위치</th><th scope="col">토큰 변화</th><th scope="col">교육용 설명</th></tr></thead><tbody>
    {groups.map((group) => <tr key={`${group.materialId}-${group.fromStreamId}-${group.toStreamId}-${group.reason}`}><th scope="row">{MATERIALS[group.materialId].name}</th><td>{streamLocationLabel(group.fromStreamId)}</td><td>{streamLocationLabel(group.toStreamId)}</td><td>{group.count}개 토큰 이동</td><td>{formatMovementGroupExplanation(group)}</td></tr>)}
    {!groups.length && <tr><th scope="row">전체</th><td>입력 물질함</td><td>변화 없음</td><td>이동한 토큰 0개</td><td>{outcome.explanation}</td></tr>}
  </tbody></table></div>;
}
