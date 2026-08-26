import type { ActionDefinition, ProcessActionId } from './contracts';
const commonSafety = '실제 활동은 교사의 안전 지도 아래 진행하며 화면의 결과를 실제 실험 결과로 사용하지 않습니다.';
const entries: readonly ActionDefinition[] = [
  { id: 'sieve', kind: 'method', name: '체로 분리', requiredPropertyIds: ['particle-size'], applicableWhen: '알갱이 크기가 다른 고체 혼합물에 적용합니다.', outputLabels: ['통과', '잔류'], recoveredAndRemaining: '작은 알갱이는 통과하고 큰 알갱이는 남습니다.', modelLimit: '체 간격은 넓음·중간·고움 범주이며 실제 규격이 아닙니다.', safetyNote: commonSafety },
  { id: 'layer-separation', kind: 'method', name: '층 분리', requiredPropertyIds: ['immiscibility'], applicableWhen: '서로 섞이지 않는 물·식용유 모형에 적용합니다.', outputLabels: ['위층', '아래층'], recoveredAndRemaining: '위층과 아래층으로 나뉘며 각 층에 물질이 남습니다.', modelLimit: '층 위치는 물·식용유 모형에만 적용됩니다.', safetyNote: commonSafety },
  { id: 'filtration', kind: 'method', name: '거르기', requiredPropertyIds: ['water-solubility', 'filter-behavior'], applicableWhen: '녹은 물질과 녹지 않은 고체가 함께 있는 혼합물에 적용합니다.', outputLabels: ['거른 액체', '거름 찌꺼기'], recoveredAndRemaining: '용해된 물질은 거른 액체에 남고 불용성 고체는 거름 찌꺼기로 남습니다.', modelLimit: '실제 여과 속도·기구를 지시하지 않습니다.', safetyNote: commonSafety },
  { id: 'virtual-evaporation', kind: 'method', name: '가상 증발', requiredPropertyIds: ['evaporation-residue'], applicableWhen: '물 운반 토큰과 소금 고체 토큰이 있는 화면 모형에 적용합니다.', outputLabels: ['화면 속 수증기 모형', '고체 잔류'], recoveredAndRemaining: '물 운반 토큰은 화면 속 수증기 모형으로 이동하고 고체 잔류가 남습니다.', modelLimit: '실제 가열 방법·온도·시간을 다루지 않습니다.', safetyNote: commonSafety },
  { id: 'add-water', kind: 'preparation', name: '물 넣기', requiredPropertyIds: ['water-solubility'], applicableWhen: '물에 녹는 성질을 비교할 고체 혼합물에 적용합니다.', outputLabels: ['섞인 물질함'], recoveredAndRemaining: '정해진 물 토큰을 가상으로 더해 섞인 물질함을 만듭니다.', modelLimit: '정해진 물 토큰 10개를 가상으로 추가합니다.', safetyNote: commonSafety },
  { id: 'wait-for-layers', kind: 'preparation', name: '층 기다리기', requiredPropertyIds: ['immiscibility'], applicableWhen: '서로 섞이지 않는 두 액체 모형에 적용합니다.', outputLabels: ['층이 생긴 물질함'], recoveredAndRemaining: '두 액체 모형이 위층과 아래층으로 보입니다.', modelLimit: '실제 대기 시간을 제시하지 않습니다.', safetyNote: commonSafety },
];
export const ACTIONS = Object.fromEntries(entries.map((item) => [item.id, item])) as Record<ProcessActionId, ActionDefinition>;
