import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../domain/missions';
import { applyProcessStep } from './applyProcessStep';
import { createInitialSimulation } from './tokenFactory';

describe('separation rules', () => {
  const expectExactLedger = (result: ReturnType<typeof applyProcessStep>, inputIds: readonly string[]) => {
    const outputIds = result.outputs.flatMap((item) => item.stream.tokenIds);
    expect([...outputIds, ...result.lostTokenIds].sort()).toEqual([...inputIds].sort());
    expect(new Set([...outputIds, ...result.lostTokenIds]).size).toBe(inputIds.length);
  };

  it.each(['wide-gap', 'medium-gap'] as const)('separates gravel and sand with %s and keeps one sand token as visible carryover', (gap) => {
    const state = createInitialSimulation(MISSIONS['size-sort']);
    const result = applyProcessStep({ missionId: 'size-sort', step: { id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap } }, input: state.streams.initial, tokens: state.tokens });
    expect(result.status).toBe('applied');
    expect(result.outputs.map((item) => item.port)).toEqual(['pass', 'retained']);
    expect(result.movements).toHaveLength(20);
    expectExactLedger(result, state.streams.initial.tokenIds);
    expect(result.outputs[1].stream.tokenIds).toContain('size-sort:sand:01');
  });

  it('returns unchanged when the fine gap retains both solids', () => {
    const state = createInitialSimulation(MISSIONS['size-sort']);
    const result = applyProcessStep({ missionId: 'size-sort', step: { id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap: 'fine-gap' } }, input: state.streams.initial, tokens: state.tokens });
    expect(result.status).toBe('no-basis');
    expect(result.reasonCode).toBe('no-size-contrast');
    expect(result.outputs[0].port).toBe('unchanged');
  });

  it('separates settled oil and water into two imperfect educational streams', () => {
    const state = createInitialSimulation(MISSIONS['liquid-layers']);
    const waited = applyProcessStep({ missionId: 'liquid-layers', step: { id: 'step-1', actionId: 'wait-for-layers', input: { source: 'initial' }, evidencePropertyId: 'immiscibility', params: {} }, input: state.streams.initial, tokens: state.tokens });
    const separated = applyProcessStep({ missionId: 'liquid-layers', step: { id: 'step-2', actionId: 'layer-separation', input: { source: 'step', stepId: 'step-1', port: 'layered-mixture' }, evidencePropertyId: 'immiscibility', params: {} }, input: waited.outputs[0].stream, tokens: waited.tokens });
    expect(separated.outputs.map((item) => item.port)).toEqual(['upper', 'lower']);
    expect(separated.explanation).toContain('토큰 1개');
    expectExactLedger(separated, waited.outputs[0].stream.tokenIds);
    expect(separated.outputs[0].stream.tokenIds).toContain('liquid-layers:water:01');
    expect(separated.outputs[1].stream.tokenIds).toContain('liquid-layers:oil:01');
  });

  it('rejects layer separation when an extra solid is present', () => {
    const state = createInitialSimulation(MISSIONS['liquid-layers']);
    const input = { ...state.streams.initial, tokenIds: [...state.streams.initial.tokenIds, 'extra'] };
    const result = applyProcessStep({ missionId: 'liquid-layers', step: { id: 'step-1', actionId: 'layer-separation', input: { source: 'initial' }, evidencePropertyId: 'immiscibility', params: {} }, input: { ...input, condition: { ...input.condition, layersSettled: true } }, tokens: { ...state.tokens, extra: { id: 'extra', materialId: 'sand', origin: 'initial', phase: 'solid' } } });
    expect(result.status).toBe('no-basis');
    expect(result.reasonCode).toBe('unsupported-mixture');
    expect(result.outputs[0].stream.tokenIds).toEqual(input.tokenIds);
  });

  it('filters dissolved salt from sand and leaves one salt token with residue', () => {
    const state = createInitialSimulation(MISSIONS['salt-recovery']);
    const mixed = applyProcessStep({ missionId: 'salt-recovery', step: { id: 'step-1', actionId: 'add-water', input: { source: 'initial' }, evidencePropertyId: 'water-solubility', params: {} }, input: state.streams.initial, tokens: state.tokens });
    const filtered = applyProcessStep({ missionId: 'salt-recovery', step: { id: 'step-2', actionId: 'filtration', input: { source: 'step', stepId: 'step-1', port: 'mixture' }, evidencePropertyId: 'filter-behavior', params: {} }, input: mixed.outputs[0].stream, tokens: mixed.tokens });
    expect(filtered.outputs.map((item) => item.port)).toEqual(['filtrate', 'filter-residue']);
    expect(filtered.outputs[1].stream.tokenIds.filter((id) => filtered.tokens[id].materialId === 'salt')).toHaveLength(1);
    expectExactLedger(filtered, mixed.outputs[0].stream.tokenIds);
    expect(filtered.outputs[1].stream.tokenIds).toContain('salt-recovery:salt:01');
  });

  it('uses a virtual evaporation output and records one salt token as loss', () => {
    const state = createInitialSimulation(MISSIONS['salt-recovery']);
    const mixed = applyProcessStep({ missionId: 'salt-recovery', step: { id: 'step-1', actionId: 'add-water', input: { source: 'initial' }, evidencePropertyId: 'water-solubility', params: {} }, input: state.streams.initial, tokens: state.tokens });
    const filtered = applyProcessStep({ missionId: 'salt-recovery', step: { id: 'step-2', actionId: 'filtration', input: { source: 'step', stepId: 'step-1', port: 'filtrate' }, evidencePropertyId: 'filter-behavior', params: {} }, input: mixed.outputs[0].stream, tokens: mixed.tokens });
    const result = applyProcessStep({ missionId: 'salt-recovery', step: { id: 'step-3', actionId: 'virtual-evaporation', input: { source: 'step', stepId: 'step-2', port: 'filtrate' }, evidencePropertyId: 'evaporation-residue', params: {} }, input: filtered.outputs[0].stream, tokens: filtered.tokens });
    expect(result.outputs.map((item) => item.port)).toEqual(['vapor-model', 'solid-residue']);
    expect(result.lostTokenIds).toHaveLength(1);
    expect(result.explanation).toContain('실제 수율을 뜻하지 않습니다');
    expectExactLedger(result, filtered.outputs[0].stream.tokenIds);
    expect(result.lostTokenIds).toEqual(['salt-recovery:salt:02']);
    expect(result.tokens['salt-recovery:salt:02'].phase).toBe('solid');
  });
});
