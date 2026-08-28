import type { MaterialId, ProcessStep, OutputPortId } from '../../domain/contracts';
import { ACTIONS } from '../../domain/actions';
import { predictionQuestion } from '../../simulation/prediction';
import { outputPortLabel } from '../../domain/displayLabels';

export interface PredictionPromptProps { step: ProcessStep; targetMaterialId: MaterialId; candidatePorts: readonly OutputPortId[]; selectedPort?: OutputPortId | undefined; onSelect: (port: OutputPortId) => void; }
export function PredictionPrompt({ step, targetMaterialId, candidatePorts, selectedPort, onSelect }: PredictionPromptProps) {
  const predictionLabels: Partial<Record<OutputPortId, string>> = { pass: '통과', retained: '잔류', upper: '위층', lower: '아래층' };
  return <fieldset className="prediction-prompt"><legend>{predictionQuestion(targetMaterialId, step.actionId)}</legend>{candidatePorts.map((port) => <label key={port}><input type="radio" name={`prediction-${step.id}`} value={port} checked={selectedPort === port} onChange={() => onSelect(port)} />{predictionLabels[port] ?? outputPortLabel(port) ?? ACTIONS[step.actionId].name}</label>)}</fieldset>;
}
