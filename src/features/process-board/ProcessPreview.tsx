import type { ProcessStep } from '../../domain/contracts';
import { ACTIONS } from '../../domain/actions';
import { getExpectedPorts } from './ActionCard';

const labels: Record<string, string> = { pass: '통과 물질', retained: '잔류 물질', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함' };
export interface ProcessPreviewProps { plan: readonly ProcessStep[]; }
export function ProcessPreview({ plan }: ProcessPreviewProps) {
  return <section className="process-preview" aria-labelledby="preview-title"><h3 id="preview-title">공정 미리보기</h3>
    {plan.length === 0 ? <p>아직 넣은 단계가 없습니다.</p> : <ol>{plan.map((step, index) => <li key={step.id}><strong>{ACTIONS[step.actionId].name}</strong> · {getExpectedPorts(step.actionId).map((port) => labels[port]).join(' · ')}{index < plan.length - 1 && <span className="preview-arrow" data-testid="preview-connector" aria-hidden="true">↓</span>}</li>)}</ol>}
  </section>;
}
