import type { MaterialDefinition, OutputPortId, PropertyId } from './contracts';

export type MaterialPropertyKey = keyof MaterialDefinition['properties'];

const propertyValues: Record<MaterialPropertyKey, Record<string, string>> = {
  state: { solid: '고체', liquid: '액체' },
  particleSize: { large: '큰 알갱이', fine: '고운 알갱이', 'not-applicable': '해당 없음' },
  waterRelationship: { 'is-water': '물', mixes: '물과 섞임', 'does-not-mix': '물과 섞이지 않음', 'not-applicable': '해당 없음' },
  waterSolubility: { dissolves: '물에 녹음', 'does-not-dissolve': '물에 녹지 않음', 'not-applicable': '해당 없음' },
  afterVirtualEvaporation: { 'solid-remains': '고체로 남음', 'carrier-removed': '운반 물질이 이동함', 'not-modelled': '가상 증발에서 다루지 않음' },
};

const propertyLabels: Record<PropertyId, string> = {
  'particle-size': '알갱이 크기', immiscibility: '서로 섞이지 않음과 층',
  'water-solubility': '물에 녹는 성질', 'filter-behavior': '거름 행동',
  'evaporation-residue': '가상 증발 후 남는 물질',
};

const portLabels: Record<OutputPortId, string> = {
  mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함', pass: '통과 물질', retained: '잔류 물질',
  upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기',
  'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', unchanged: '변화 없음',
};

export function materialPropertyValueLabel(key: MaterialPropertyKey, value: string): string {
  return propertyValues[key][value] ?? '교육용 정보';
}

export function propertyEvidenceLabel(propertyId: PropertyId): string {
  return propertyLabels[propertyId] ?? '교육용 정보';
}

export function outputPortLabel(port: OutputPortId): string {
  return portLabels[port] ?? '교육용 정보';
}

export function streamLocationLabel(location: string): string {
  if (location === 'initial') return '처음 혼합물';
  if (location === 'loss') return '교육용 손실';
  const match = /^step-(\d+):([a-z-]+)$/.exec(location);
  if (!match) return '교육용 정보';
  const port = match[2] as OutputPortId;
  return `${match[1]}단계의 ${outputPortLabel(port)}`;
}
