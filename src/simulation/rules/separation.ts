import type { MaterialToken, ProcessOutcome, RuleContext, TokenMovement } from '../contracts';
import type { OutputPortId } from '../../domain/contracts';
import { createNoBasisOutcome } from '../noBasis';
import { outputStreamId } from '../streamRefs';

const byId = (tokens: Readonly<Record<string, MaterialToken>>, ids: readonly string[]) =>
  [...ids].sort((left, right) => left.localeCompare(right)).map((id) => tokens[id]).filter((token): token is MaterialToken => Boolean(token));
type SeparationPort = Exclude<OutputPortId, 'mixture' | 'layered-mixture' | 'unchanged'>;

function appliedOutcome(
  context: RuleContext,
  tokens: Readonly<Record<string, MaterialToken>>,
  groups: readonly { port: SeparationPort; tokenIds: readonly string[] }[],
  movements: readonly TokenMovement[],
  lostTokenIds: readonly string[],
  explanation: string,
): ProcessOutcome {
  return {
    stepId: context.step.id, actionId: context.step.actionId, status: 'applied', reasonCode: null,
    explanation, tokens,
    outputs: groups.map(({ port, tokenIds }) => ({ port, stream: { id: outputStreamId(context.step.id, port), tokenIds, condition: { ...context.input.condition }, consumedByStepId: null } })),
    movements, addedTokenIds: [], lostTokenIds,
  };
}

export function applySeparationAction(context: RuleContext): ProcessOutcome {
  const inputTokens = byId(context.tokens, context.input.tokenIds);
  const idsByPort = new Map<string, string[]>();
  const add = (port: string, id: string) => idsByPort.set(port, [...(idsByPort.get(port) ?? []), id]);
  const movements: TokenMovement[] = [];
  const move = (token: MaterialToken, port: SeparationPort, reason: string) => {
    const destination = outputStreamId(context.step.id, port);
    add(port, token.id);
    movements.push({ tokenId: token.id, stepId: context.step.id, fromStreamId: context.input.id, toStreamId: destination, reason });
  };

  if (context.step.actionId === 'sieve') {
    const materials = new Set(inputTokens.map((token) => token.materialId));
    const valid = inputTokens.every((token) => (token.materialId === 'gravel' || token.materialId === 'sand' || token.materialId === 'salt') && token.phase === 'solid');
    if (!valid || !materials.has('gravel') || !materials.has('sand')) return createNoBasisOutcome(context, 'unsupported-mixture');
    if (context.step.params.gap === 'fine-gap') return createNoBasisOutcome(context, 'no-size-contrast');
    const smallestSand = inputTokens.filter((token) => token.materialId === 'sand')[0]?.id;
    for (const token of inputTokens) move(token, token.materialId === 'gravel' || token.id === smallestSand ? 'retained' : 'pass', 'particle-size');
    return appliedOutcome(context, context.tokens, [
      { port: 'pass', tokenIds: idsByPort.get('pass') ?? [] },
      { port: 'retained', tokenIds: idsByPort.get('retained') ?? [] },
    ], movements, [], '큰 자갈은 남고 모래는 통과하며 모래 토큰 1개가 화면에 혼입되어 보입니다.');
  }

  if (context.step.actionId === 'layer-separation') {
    if (context.input.condition.layersSettled !== true) return createNoBasisOutcome(context, 'layers-not-settled');
    const materials = new Set(inputTokens.map((token) => token.materialId));
    if (materials.size !== 2 || !materials.has('water') || !materials.has('oil')) return createNoBasisOutcome(context, 'unsupported-mixture');
    const smallestWater = inputTokens.filter((token) => token.materialId === 'water')[0]?.id;
    const smallestOil = inputTokens.filter((token) => token.materialId === 'oil')[0]?.id;
    for (const token of inputTokens) {
      const port: SeparationPort = token.materialId === 'water' ? (token.id === smallestWater ? 'upper' : 'lower') : (token.id === smallestOil ? 'lower' : 'upper');
      move(token, port, 'immiscibility');
    }
    return appliedOutcome(context, context.tokens, [
      { port: 'upper', tokenIds: idsByPort.get('upper') ?? [] },
      { port: 'lower', tokenIds: idsByPort.get('lower') ?? [] },
    ], movements, [], '식용유 모형은 위층, 물은 아래층으로 나뉘지만 각 층에 토큰 1개가 섞여 남습니다.');
  }

  if (context.step.actionId === 'filtration') {
    if (context.input.condition.waterAdded !== true) return createNoBasisOutcome(context, 'no-filter-contrast');
    const valid = inputTokens.every((token) => (token.materialId === 'water' && token.phase === 'liquid') || (token.materialId === 'salt' && token.phase === 'dissolved') || ((token.materialId === 'gravel' || token.materialId === 'sand') && token.phase === 'solid'));
    if (!valid) return createNoBasisOutcome(context, 'unsupported-mixture');
    const hasWater = inputTokens.some((token) => token.materialId === 'water' && token.phase === 'liquid');
    const hasDissolved = inputTokens.some((token) => token.materialId === 'salt' && token.phase === 'dissolved');
    const hasSolid = inputTokens.some((token) => token.materialId !== 'salt' && token.materialId !== 'water' && token.phase === 'solid');
    if (!hasWater) return createNoBasisOutcome(context, 'unsupported-mixture');
    if (!hasDissolved || !hasSolid) return createNoBasisOutcome(context, 'no-dissolved-solid');
    const smallestDissolvedSalt = inputTokens.filter((token) => token.materialId === 'salt' && token.phase === 'dissolved')[0]?.id;
    for (const token of inputTokens) {
      const isFiltrate = token.materialId === 'water' || (token.materialId === 'salt' && token.phase === 'dissolved' && token.id !== smallestDissolvedSalt);
      move(token, isFiltrate ? 'filtrate' : 'filter-residue', 'filter-behavior');
    }
    return appliedOutcome(context, context.tokens, [
      { port: 'filtrate', tokenIds: idsByPort.get('filtrate') ?? [] },
      { port: 'filter-residue', tokenIds: idsByPort.get('filter-residue') ?? [] },
    ], movements, [], '물과 녹은 소금은 거른 액체로, 고체는 거름 찌꺼기로 이동하며 용해된 소금 토큰 1개가 남습니다.');
  }

  if (context.step.actionId === 'virtual-evaporation') {
    const valid = inputTokens.every((token) => (token.materialId === 'water' && token.phase === 'liquid') || (token.materialId === 'salt' && token.phase === 'dissolved'));
    if (!valid) return createNoBasisOutcome(context, 'unsupported-mixture');
    const hasDissolvedSalt = inputTokens.some((token) => token.materialId === 'salt' && token.phase === 'dissolved');
    const hasWater = inputTokens.some((token) => token.materialId === 'water' && token.phase === 'liquid');
    if (!hasDissolvedSalt || !hasWater) return createNoBasisOutcome(context, 'no-dissolved-solid');
    const smallestSalt = inputTokens.filter((token) => token.materialId === 'salt' && token.phase === 'dissolved')[0]?.id;
    const nextTokens: Record<string, MaterialToken> = { ...context.tokens };
    for (const token of inputTokens) {
      if (token.materialId === 'salt') nextTokens[token.id] = { ...token, phase: 'solid' };
      if (token.id === smallestSalt) {
        movements.push({ tokenId: token.id, stepId: context.step.id, fromStreamId: context.input.id, toStreamId: 'loss', reason: 'educational-loss' });
        add('loss', token.id);
      } else move(token, token.materialId === 'water' ? 'vapor-model' : 'solid-residue', 'virtual-evaporation');
    }
    return appliedOutcome(context, nextTokens, [
      { port: 'vapor-model', tokenIds: idsByPort.get('vapor-model') ?? [] },
      { port: 'solid-residue', tokenIds: idsByPort.get('solid-residue') ?? [] },
    ], movements, smallestSalt ? [smallestSalt] : [], '화면 속 가상 변화로 물은 증기 모형이 되고 소금은 고체 잔류로 남습니다. 교육용 손실 토큰 1개를 기록하며 실제 수율을 뜻하지 않습니다.');
  }

  return createNoBasisOutcome(context, 'unsupported-mixture');
}
