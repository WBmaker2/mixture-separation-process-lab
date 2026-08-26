import type { MaterialToken, ProcessOutcome, RuleContext } from '../contracts';
import { outputStreamId } from '../streamRefs';
import { createNoBasisOutcome } from '../noBasis';

function movedOutcome(context: RuleContext, tokens: Readonly<Record<string, MaterialToken>>, addedTokenIds: readonly string[], condition: { waterAdded: boolean; layersSettled: boolean }, port: 'mixture' | 'layered-mixture'): ProcessOutcome {
  const streamId = outputStreamId(context.step.id, port);
  const tokenIds = [...context.input.tokenIds, ...addedTokenIds];
  return {
    stepId: context.step.id, actionId: context.step.actionId, status: 'applied', reasonCode: null,
    explanation: port === 'mixture' ? '물이 더해져 소금이 녹은 혼합물' : '물과 기름 모형의 층이 관찰됨',
    tokens, outputs: [{ port, stream: { id: streamId, tokenIds, condition, consumedByStepId: null } }],
    movements: context.input.tokenIds.map((tokenId) => ({ tokenId, stepId: context.step.id, fromStreamId: context.input.id, toStreamId: streamId, reason: 'preparation' })),
    addedTokenIds, lostTokenIds: [],
  };
}

export function applyPreparationAction(context: RuleContext): ProcessOutcome {
  if (context.step.actionId === 'add-water') {
    const hasSalt = context.input.tokenIds.some((id) => context.tokens[id]?.materialId === 'salt');
    const hasWater = context.input.tokenIds.some((id) => context.tokens[id]?.materialId === 'water' || context.tokens[id]?.origin === 'added-carrier');
    if (!hasSalt || hasWater) return createNoBasisOutcome(context, 'unsupported-mixture');
    const tokens: Record<string, MaterialToken> = { ...context.tokens };
    for (const id of context.input.tokenIds) if (tokens[id]?.materialId === 'salt') tokens[id] = { ...tokens[id], phase: 'dissolved' };
    const addedTokenIds: string[] = [];
    for (let index = 1; index <= 10; index += 1) {
      const id = `${context.missionId}:carrier-water:${String(index).padStart(2, '0')}`;
      tokens[id] = { id, materialId: 'water', origin: 'added-carrier', phase: 'liquid' };
      addedTokenIds.push(id);
    }
    return movedOutcome(context, tokens, addedTokenIds, { waterAdded: true, layersSettled: false }, 'mixture');
  }
  if (context.step.actionId === 'wait-for-layers') {
    const materialIds = new Set(context.input.tokenIds.map((id) => context.tokens[id]?.materialId));
    if (materialIds.size !== 2 || !materialIds.has('water') || !materialIds.has('oil')) return createNoBasisOutcome(context, 'layers-not-settled');
    return movedOutcome(context, context.tokens, [], { ...context.input.condition, layersSettled: true }, 'layered-mixture');
  }
  return createNoBasisOutcome(context, 'unsupported-mixture');
}
