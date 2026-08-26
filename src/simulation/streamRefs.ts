import type { StreamRef, OutputPortId } from '../domain/contracts';
import type { MaterialStream, SimulationState } from './contracts';

export function outputStreamId(stepId: string, port: OutputPortId): string {
  return `${stepId}:${port}`;
}

export function resolveStreamRef(state: SimulationState, ref: StreamRef): MaterialStream | null {
  if (ref.source === 'initial') return state.streams.initial ?? null;
  return state.streams[outputStreamId(ref.stepId, ref.port)] ?? null;
}
