import { MATERIALS } from '../domain/materials';
import type { MaterialId, OutputPortId, ProcessStep } from '../domain/contracts';
import type { ProcessOutcome, SimulationRun } from './contracts';
export interface PredictionCheck { targetMaterialId: MaterialId; expectedPorts: readonly OutputPortId[]; selectedPort: OutputPortId; matched: boolean; }
function inputStreamId(step: ProcessStep) { return step.input.source === 'initial' ? 'initial' : `${step.input.stepId}:${step.input.port}`; }
export function getPredictionTargetMaterialId(run: SimulationRun, step: ProcessStep, selectedTargetIds: readonly MaterialId[]): MaterialId | null {
  const ids = run.streams[inputStreamId(step)]?.tokenIds ?? [];
  const materials = ids.map((id) => run.tokens[id]?.materialId).filter((id): id is MaterialId => Boolean(id));
  return selectedTargetIds.find((id) => materials.includes(id)) ?? materials[0] ?? null;
}
export function getExpectedPredictionPorts(outcome: ProcessOutcome, targetMaterialId: MaterialId): readonly OutputPortId[] {
  const counts = new Map<OutputPortId, number>();
  outcome.movements.forEach((movement) => {
    if (outcome.tokens[movement.tokenId]?.materialId !== targetMaterialId || movement.toStreamId === 'loss') return;
    const port = movement.toStreamId.split(':').at(-1) as OutputPortId;
    counts.set(port, (counts.get(port) ?? 0) + 1);
  });
  if (!counts.size) return ['unchanged'];
  const max = Math.max(...counts.values());
  return [...counts.entries()].filter(([, count]) => count === max).map(([port]) => port).sort();
}
export function evaluatePrediction(outcome: ProcessOutcome, targetMaterialId: MaterialId, selectedPort: OutputPortId): PredictionCheck {
  const expectedPorts = getExpectedPredictionPorts(outcome, targetMaterialId);
  return { targetMaterialId, expectedPorts, selectedPort, matched: expectedPorts.includes(selectedPort) };
}
export function predictionQuestion(targetMaterialId: MaterialId, _actionId: ProcessStep['actionId']): string { return `${MATERIALS[targetMaterialId].name} 토큰은 어느 출력에 있을까요?`; }
