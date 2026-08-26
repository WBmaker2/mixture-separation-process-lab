import type { MaterialId, MissionDefinition, MissionId } from './contracts';
export const MISSION_IDS = ['size-sort', 'liquid-layers', 'salt-recovery', 'integrated-process'] as const;
const entries: readonly MissionDefinition[] = [
  { id: 'size-sort', order: 1, title: '크기 선별선', mixtureLabel: '큰 자갈과 고운 모래', initialMaterials: ['gravel', 'sand'], tokensPerMaterial: 10, goal: { mode: 'single-choice', selectableTargets: ['gravel', 'sand'], requiredTargets: [] }, requiredPropertyIds: ['particle-size'], allowedActionIds: ['sieve'], challenge: '알갱이 크기의 차이를 이용해 목표 물질을 골라 회수하세요.' },
  { id: 'liquid-layers', order: 2, title: '두 액체 관찰조', mixtureLabel: '물과 식용유 모형', initialMaterials: ['water', 'oil'], tokensPerMaterial: 10, goal: { mode: 'single-choice', selectableTargets: ['water', 'oil'], requiredTargets: [] }, requiredPropertyIds: ['immiscibility'], allowedActionIds: ['wait-for-layers', 'layer-separation'], challenge: '서로 섞이지 않는 두 액체 모형의 층을 관찰하고 목표를 회수하세요.' },
  { id: 'salt-recovery', order: 3, title: '소금 회수선', mixtureLabel: '소금과 고운 모래', initialMaterials: ['salt', 'sand'], tokensPerMaterial: 10, goal: { mode: 'single-choice', selectableTargets: ['salt', 'sand'], requiredTargets: [] }, requiredPropertyIds: ['water-solubility', 'filter-behavior', 'evaporation-residue'], allowedActionIds: ['add-water', 'filtration', 'virtual-evaporation'], challenge: '물에 녹는 성질과 거름 행동을 이용해 소금을 회수하세요.' },
  { id: 'integrated-process', order: 4, title: '통합 공정', mixtureLabel: '큰 자갈·고운 모래·소금', initialMaterials: ['gravel', 'sand', 'salt'], tokensPerMaterial: 10, goal: { mode: 'all-components', selectableTargets: [], requiredTargets: ['gravel', 'sand', 'salt'] }, requiredPropertyIds: ['particle-size', 'water-solubility', 'filter-behavior', 'evaporation-residue'], allowedActionIds: ['sieve', 'add-water', 'filtration', 'virtual-evaporation'], challenge: '자갈·모래·소금을 각각 회수하는 통합 공정을 설계하세요.' },
];
export const MISSIONS = Object.fromEntries(entries.map((item) => [item.id, item])) as Record<MissionId, MissionDefinition>;
export function getMission(missionId: MissionId): MissionDefinition { return MISSIONS[missionId]; }
export function missionTargetsReady(missionId: MissionId | null, selectedTargetIds: readonly MaterialId[]): boolean {
  if (!missionId) return false;
  const goal = MISSIONS[missionId].goal;
  if (goal.mode === 'all-components') return selectedTargetIds.length === goal.requiredTargets.length && goal.requiredTargets.every((id) => selectedTargetIds.includes(id));
  return selectedTargetIds.length === 1 && goal.selectableTargets.includes(selectedTargetIds[0]);
}
