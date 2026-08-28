import type { MaterialId, ProcessStep, OutputPortId } from '../../domain/contracts';
import { ACTIONS } from '../../domain/actions';
import { predictionQuestion } from '../../simulation/prediction';

export interface PredictionPromptProps { step: ProcessStep; targetMaterialId: MaterialId; candidatePorts: readonly OutputPortId[]; selectedPort?: OutputPortId | undefined; onSelect: (port: OutputPortId) => void; }
export function PredictionPrompt({ step, targetMaterialId, candidatePorts, selectedPort, onSelect }: PredictionPromptProps) {
  const labels: Record<OutputPortId, string> = { pass: '통과', retained: '잔류', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', unchanged: '변화 없음' };
  return <fieldset className="prediction-prompt"><legend>{predictionQuestion(targetMaterialId, step.actionId)}</legend>{candidatePorts.map((port) => <label key={port}><input type="radio" name={`prediction-${step.id}`} value={port} checked={selectedPort === port} onChange={() => onSelect(port)} />{labels[port] ?? ACTIONS[step.actionId].name}</label>)}</fieldset>;
}
