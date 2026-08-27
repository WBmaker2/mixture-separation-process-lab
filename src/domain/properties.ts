import type { PropertyDefinition, PropertyId } from './contracts';
const entries: readonly PropertyDefinition[] = [
  { id: 'particle-size', name: '알갱이 크기', question: '두 물질의 알갱이 크기는 어떻게 다른가요?', evidenceSentence: '알갱이 크기가 다르기 때문에 체로 나눌 수 있습니다.' },
  { id: 'immiscibility', name: '서로 섞이지 않음과 층', question: '두 액체 모형은 섞인 뒤 어떻게 보이나요?', evidenceSentence: '서로 섞이지 않아 층이 생기기 때문에 나눌 수 있습니다.' },
  { id: 'water-solubility', name: '물에 녹는 성질', question: '물에 넣었을 때 어느 고체의 상태가 달라지나요?', evidenceSentence: '소금은 물에 녹고 모래는 녹지 않기 때문에 상태를 다르게 만들 수 있습니다.' },
  { id: 'filter-behavior', name: '거름 행동', question: '거를 때 어느 물질이 통과하고 어느 물질이 남나요?', evidenceSentence: '용해된 물질과 불용성 고체의 상태가 다르기 때문에 거를 수 있습니다.' },
  { id: 'evaporation-residue', name: '가상 증발 후 남는 물질', question: '화면 속 물 운반 토큰이 이동한 뒤 무엇이 남나요?', evidenceSentence: '물 운반 토큰은 이동하고 소금 고체 토큰은 남기 때문에 회수할 수 있습니다.' },
];
export const PROPERTIES = Object.fromEntries(entries.map((item) => [item.id, item])) as Record<PropertyId, PropertyDefinition>;
