import type { RuleContext, ProcessOutcome, TokenMovement } from './contracts';
import type { NoBasisReason } from './contracts';

export function createNoBasisOutcome(context: RuleContext, reasonCode: NoBasisReason): ProcessOutcome {
  const toStreamId = `${context.step.id}:unchanged`;
  const tokenIds = [...context.input.tokenIds];
  const movements: TokenMovement[] = tokenIds.map((tokenId) => ({
    tokenId, stepId: context.step.id, fromStreamId: context.input.id,
    toStreamId, reason: 'unchanged',
  }));
  const stream = { id: toStreamId, tokenIds, condition: { ...context.input.condition }, consumedByStepId: null };
  return {
    stepId: context.step.id, actionId: context.step.actionId, status: 'no-basis', reasonCode,
    explanation: '이 조건에서는 분리 근거가 없음', tokens: context.tokens,
    outputs: [{ port: 'unchanged', stream }], movements, addedTokenIds: [], lostTokenIds: [],
  };
}
