import type { MaterialId, MissionId, OutputPortId, ProcessStep } from '../domain/contracts';

export type TokenPhase = 'solid' | 'liquid' | 'dissolved';
export type TokenOrigin = 'initial' | 'added-carrier';
export type ProcessStatus = 'applied' | 'no-basis';
export type NoBasisReason =
  | 'missing-water' | 'layers-not-settled' | 'no-size-contrast' | 'no-filter-contrast'
  | 'no-dissolved-solid' | 'unsupported-mixture';

export interface MaterialToken { id: string; materialId: MaterialId; origin: TokenOrigin; phase: TokenPhase; }
export interface StreamCondition { waterAdded: boolean; layersSettled: boolean; }
export interface MaterialStream {
  id: string;
  tokenIds: readonly string[];
  condition: StreamCondition;
  consumedByStepId: string | null;
}
export interface TokenMovement {
  tokenId: string; stepId: string; fromStreamId: string; toStreamId: string | 'loss'; reason: string;
}
export interface ProcessOutput { port: OutputPortId; stream: MaterialStream; }
export interface ProcessOutcome {
  stepId: string; actionId: ProcessStep['actionId']; status: ProcessStatus;
  reasonCode: NoBasisReason | null; explanation: string;
  tokens: Readonly<Record<string, MaterialToken>>; outputs: readonly ProcessOutput[];
  movements: readonly TokenMovement[]; addedTokenIds: readonly string[]; lostTokenIds: readonly string[];
}
export interface SimulationState {
  missionId: MissionId; tokens: Readonly<Record<string, MaterialToken>>;
  streams: Readonly<Record<string, MaterialStream>>; outcomes: readonly ProcessOutcome[];
  movements: readonly TokenMovement[]; lostTokenIds: readonly string[];
}
export interface RuleContext {
  missionId: MissionId; step: ProcessStep; input: MaterialStream;
  tokens: Readonly<Record<string, MaterialToken>>;
}
