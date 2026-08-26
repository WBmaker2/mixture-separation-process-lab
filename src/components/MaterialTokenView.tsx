import { MATERIALS } from '../domain/materials';
import type { MaterialId } from '../domain/contracts';

export interface MaterialTokenViewProps { materialId: MaterialId; count?: number; }

export function MaterialTokenView({ materialId, count }: MaterialTokenViewProps) {
  const material = MATERIALS[materialId];
  const label = `${material.name}, ${material.patternLabel} 무늬, ${material.shapeLabel} 모양${count === undefined ? '' : `, ${count}개`}`;
  return <span className={`material-token material-${materialId}`} aria-label={label} title={label}>
    <span className="token-shape" aria-hidden="true">{material.patternLabel}</span>
    <span className="token-copy"><strong>{material.name}</strong><small>{material.shapeLabel} · {material.patternLabel} 무늬</small>{count !== undefined && <small>{count}개</small>}</span>
  </span>;
}
