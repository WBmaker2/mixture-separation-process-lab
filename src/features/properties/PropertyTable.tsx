import { MATERIALS } from '../../domain/materials';
import { materialPropertyValueLabel } from '../../domain/displayLabels';
import type { MaterialId } from '../../domain/contracts';
import { MaterialTokenView } from '../../components/MaterialTokenView';

export interface PropertyTableProps { materialIds: readonly MaterialId[]; }

export function PropertyTable({ materialIds }: PropertyTableProps) {
  return <div className="table-scroll" role="region" aria-label="미션 물질 성질표">
    <table className="property-table">
      <caption>미션 물질 성질표</caption>
      <thead><tr><th scope="col">물질</th><th scope="col">상태</th><th scope="col">알갱이</th><th scope="col">물과의 관계</th></tr></thead>
      <tbody>{materialIds.map((id) => {
        const material = MATERIALS[id];
        return <tr className="property-table-row" key={id}>
          <th scope="row"><MaterialTokenView materialId={id} /></th>
          <td data-label="상태">{materialPropertyValueLabel('state', material.properties.state)}</td>
          <td data-label="알갱이">{materialPropertyValueLabel('particleSize', material.properties.particleSize)}</td>
          <td data-label="물과의 관계">{materialPropertyValueLabel('waterRelationship', material.properties.waterRelationship)}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
