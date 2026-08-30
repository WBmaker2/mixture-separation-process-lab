import type { OutputPortId, ProcessActionId, PropertyId } from '../../domain/contracts';
import { ACTIONS } from '../../domain/actions';
import { PROPERTIES } from '../../domain/properties';

export const EXPECTED_PORTS: Readonly<Record<ProcessActionId, readonly OutputPortId[]>> = {
  sieve: ['pass', 'retained'], 'layer-separation': ['upper', 'lower'], filtration: ['filtrate', 'filter-residue'],
  'virtual-evaporation': ['vapor-model', 'solid-residue'], 'add-water': ['mixture'], 'wait-for-layers': ['layered-mixture'],
};
export function getExpectedPorts(actionId: ProcessActionId): readonly OutputPortId[] { return EXPECTED_PORTS[actionId]; }

export interface ActionCardProps { actionId: ProcessActionId; confirmedPropertyIds: readonly PropertyId[]; disabled?: boolean; onSelect: () => void; selected?: boolean; }
export function ActionCard({ actionId, confirmedPropertyIds, disabled = false, onSelect, selected = false }: ActionCardProps) {
  const action = ACTIONS[actionId];
  const missing = action.requiredPropertyIds.filter((id) => !confirmedPropertyIds.includes(id));
  const blocked = disabled || missing.length > 0;
  const prefix = action.kind === 'method' ? '방법 선택' : '준비 행동 선택';
  return <article className={`action-card${selected ? ' action-card-selected' : ''}`}>
    <span className="action-kind">{action.kind === 'method' ? '분리 방법' : '준비 행동'}</span>
    <button type="button" aria-label={`${prefix}: ${action.name}`} disabled={blocked} onClick={onSelect}>{action.name}</button>
    <p>{action.applicableWhen}</p>
    <p><strong>출력:</strong> {action.outputLabels.join(', ')}</p>
    <p><strong>남는 혼합물:</strong> {action.recoveredAndRemaining}</p>
    <p><strong>모형의 한계:</strong> {action.modelLimit}</p>
    <p><strong>안전:</strong> {action.safetyNote}</p>
    {missing.length > 0 && <p className="action-card-warning">{missing.map((id) => PROPERTIES[id].name).join(', ')} 성질을 먼저 확인하세요.</p>}
  </article>;
}
