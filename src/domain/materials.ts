import type { MaterialDefinition, MaterialId } from './contracts';
const entries: readonly MaterialDefinition[] = [
  { id: 'gravel', name: '큰 자갈', colorToken: '--material-gravel', patternLabel: '큰 점박이', shapeLabel: '둥근 다각형', properties: { state: 'solid', particleSize: 'large', waterRelationship: 'not-applicable', waterSolubility: 'does-not-dissolve', afterVirtualEvaporation: 'not-modelled' } },
  { id: 'sand', name: '고운 모래', colorToken: '--material-sand', patternLabel: '잔점', shapeLabel: '작은 원', properties: { state: 'solid', particleSize: 'fine', waterRelationship: 'not-applicable', waterSolubility: 'does-not-dissolve', afterVirtualEvaporation: 'not-modelled' } },
  { id: 'salt', name: '소금', colorToken: '--material-salt', patternLabel: '사선', shapeLabel: '작은 정육면체', properties: { state: 'solid', particleSize: 'fine', waterRelationship: 'not-applicable', waterSolubility: 'dissolves', afterVirtualEvaporation: 'solid-remains' } },
  { id: 'water', name: '물', colorToken: '--material-water', patternLabel: '물결', shapeLabel: '물방울', properties: { state: 'liquid', particleSize: 'not-applicable', waterRelationship: 'is-water', waterSolubility: 'not-applicable', afterVirtualEvaporation: 'carrier-removed' } },
  { id: 'oil', name: '식용유 모형', colorToken: '--material-oil', patternLabel: '넓은 물결', shapeLabel: '타원 방울', properties: { state: 'liquid', particleSize: 'not-applicable', waterRelationship: 'does-not-mix', waterSolubility: 'not-applicable', afterVirtualEvaporation: 'not-modelled' } },
];
export const MATERIALS = Object.fromEntries(entries.map((item) => [item.id, item])) as Record<MaterialId, MaterialDefinition>;
