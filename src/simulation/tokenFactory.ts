import type { MissionDefinition } from '../domain/contracts';
import { MATERIALS } from '../domain/materials';
import type { MaterialToken, SimulationState } from './contracts';

export function createInitialSimulation(mission: MissionDefinition): SimulationState {
  const tokens: Record<string, MaterialToken> = {};
  const tokenIds: string[] = [];
  for (const materialId of mission.initialMaterials) {
    const phase = MATERIALS[materialId].properties.state;
    for (let index = 1; index <= mission.tokensPerMaterial; index += 1) {
      const id = `${mission.id}:${materialId}:${String(index).padStart(2, '0')}`;
      tokens[id] = { id, materialId, origin: 'initial', phase };
      tokenIds.push(id);
    }
  }
  return {
    missionId: mission.id,
    tokens,
    streams: { initial: { id: 'initial', tokenIds, condition: { waterAdded: false, layersSettled: false }, consumedByStepId: null } },
    outcomes: [], movements: [], lostTokenIds: [],
  };
}
