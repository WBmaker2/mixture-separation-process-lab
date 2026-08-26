export type MissionId =
  | 'size-sort'
  | 'liquid-layers'
  | 'salt-recovery'
  | 'integrated-process';
export type MaterialId = 'gravel' | 'sand' | 'salt' | 'water' | 'oil';
export type PropertyId =
  | 'particle-size'
  | 'immiscibility'
  | 'water-solubility'
  | 'filter-behavior'
  | 'evaporation-residue';
export type SeparationMethodId =
  | 'sieve'
  | 'layer-separation'
  | 'filtration'
  | 'virtual-evaporation';
export type PreparationActionId = 'add-water' | 'wait-for-layers';
export type ProcessActionId = SeparationMethodId | PreparationActionId;
export type SieveGap = 'wide-gap' | 'medium-gap' | 'fine-gap';
export type OutputPortId =
  | 'mixture' | 'layered-mixture' | 'pass' | 'retained' | 'upper' | 'lower'
  | 'filtrate' | 'filter-residue' | 'vapor-model' | 'solid-residue' | 'unchanged';
export type StreamRef = { source: 'initial' } | { source: 'step'; stepId: string; port: OutputPortId };
export type ProcessStep =
  | { id: string; actionId: 'sieve'; input: StreamRef; evidencePropertyId: 'particle-size'; params: { gap: SieveGap } }
  | { id: string; actionId: 'layer-separation'; input: StreamRef; evidencePropertyId: 'immiscibility'; params: Record<string, never> }
  | { id: string; actionId: 'filtration'; input: StreamRef; evidencePropertyId: 'filter-behavior'; params: Record<string, never> }
  | { id: string; actionId: 'virtual-evaporation'; input: StreamRef; evidencePropertyId: 'evaporation-residue'; params: Record<string, never> }
  | { id: string; actionId: 'add-water'; input: StreamRef; evidencePropertyId: 'water-solubility'; params: Record<string, never> }
  | { id: string; actionId: 'wait-for-layers'; input: StreamRef; evidencePropertyId: 'immiscibility'; params: Record<string, never> };

export interface MaterialDefinition {
  id: MaterialId; name: string; colorToken: string; patternLabel: string; shapeLabel: string;
  properties: { state: 'solid' | 'liquid'; particleSize: 'large' | 'fine' | 'not-applicable'; waterRelationship: 'is-water' | 'mixes' | 'does-not-mix' | 'not-applicable'; waterSolubility: 'dissolves' | 'does-not-dissolve' | 'not-applicable'; afterVirtualEvaporation: 'solid-remains' | 'carrier-removed' | 'not-modelled' };
}
export interface PropertyDefinition { id: PropertyId; name: string; question: string; evidenceSentence: string; }
export interface ActionDefinition { id: ProcessActionId; kind: 'method' | 'preparation'; name: string; requiredPropertyIds: readonly PropertyId[]; applicableWhen: string; outputLabels: readonly string[]; recoveredAndRemaining: string; modelLimit: string; safetyNote: string; }
export interface MissionDefinition { id: MissionId; order: 1 | 2 | 3 | 4; title: string; mixtureLabel: string; initialMaterials: readonly MaterialId[]; tokensPerMaterial: 10; goal: { mode: 'single-choice'; selectableTargets: readonly MaterialId[]; requiredTargets: readonly [] } | { mode: 'all-components'; selectableTargets: readonly []; requiredTargets: readonly MaterialId[] }; requiredPropertyIds: readonly PropertyId[]; allowedActionIds: readonly ProcessActionId[]; challenge: string; }
