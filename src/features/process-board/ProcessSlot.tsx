import type { ProcessStep } from '../../domain/contracts';
import { ACTIONS } from '../../domain/actions';
import { getExpectedPorts } from './ActionCard';
import { outputPortLabel, propertyEvidenceLabel, streamLocationLabel } from '../../domain/displayLabels';
export interface ProcessSlotProps { step: ProcessStep; index: number; total: number; brokenInput?: boolean; onReplace: () => void; onMove: (direction: 'up' | 'down') => void; onRemove: () => void; }
export function ProcessSlot({ step, index, total, brokenInput = false, onReplace, onMove, onRemove }: ProcessSlotProps) {
  return <li className={`process-slot${brokenInput ? ' process-slot-broken' : ''}`}>
    <div><strong>{index + 1}단계: {ACTIONS[step.actionId].name}</strong><p>근거 성질: {propertyEvidenceLabel(step.evidencePropertyId)}</p><p>입력: {step.input.source === 'initial' ? streamLocationLabel('initial') : streamLocationLabel(`${step.input.stepId}:${step.input.port}`)}</p><p>예상 출력: {getExpectedPorts(step.actionId).map((port) => outputPortLabel(port)).join(', ')}</p></div>
    {brokenInput && <p role="alert" tabIndex={0} className="broken-warning">⚠ 앞 단계 출력 연결을 다시 선택하세요</p>}
    <div className="slot-controls"><button type="button" onClick={onReplace}>{index + 1}단계 교체</button><button type="button" disabled={index === 0} onClick={() => onMove('up')}>{index + 1}단계 위로</button><button type="button" disabled={index === total - 1} onClick={() => onMove('down')}>{index + 1}단계 아래로</button><button type="button" onClick={onRemove}>{index + 1}단계 삭제</button></div>
  </li>;
}
