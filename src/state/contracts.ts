import type { MissionId, MaterialId, PropertyId, ProcessStep, OutputPortId } from '../domain/contracts';
import type { RecoveryClaim } from '../domain/contracts';
import type { SimulationRun } from '../simulation/contracts';
export type LabStage = 'intake' | 'properties' | 'design' | 'simulation' | 'quality' | 'revision' | 'report';
export type AttentionActionId = 'select-mission' | 'select-target' | 'confirm-properties' | 'prepare-simulation' | 'predict-next-step' | 'inspect-quality' | 'revise-process' | 'complete-report';
export interface LabSession { schemaVersion: 1; stage: LabStage; attempt: 'initial' | 'revised'; missionId: MissionId | null; selectedTargetIds: readonly MaterialId[]; confirmedPropertyIds: readonly PropertyId[]; draftPlan: readonly ProcessStep[]; planHistory: readonly (readonly ProcessStep[])[]; initialPlan: readonly ProcessStep[] | null; revisedPlan: readonly ProcessStep[] | null; predictions: Readonly<Record<string, OutputPortId>>; completedStepIds: readonly string[]; currentRun: SimulationRun | null; recoveryClaims: readonly RecoveryClaim[]; revisionReason: string; sustainabilityReflection: string; }
export type LabAction =
 | { type: 'select-mission'; missionId: MissionId } | { type: 'set-targets'; materialIds: readonly MaterialId[] } | { type: 'toggle-property'; propertyId: PropertyId }
 | { type: 'add-step'; step: ProcessStep } | { type: 'replace-step'; stepId: string; replacement: ProcessStep } | { type: 'move-step'; stepId: string; direction: 'up' | 'down' } | { type: 'remove-step'; stepId: string } | { type: 'undo-plan' } | { type: 'restore-initial-plan' }
 | { type: 'start-simulation' } | { type: 'record-prediction'; stepId: string; port: OutputPortId } | { type: 'record-step-complete'; stepId: string } | { type: 'set-run'; run: SimulationRun } | { type: 'set-recovery-claim'; claim: RecoveryClaim }
 | { type: 'begin-revision' } | { type: 'set-revision-reason'; reason: string } | { type: 'set-sustainability-reflection'; reflection: string } | { type: 'finish-revision' } | { type: 'advance' } | { type: 'reset-mission' };
