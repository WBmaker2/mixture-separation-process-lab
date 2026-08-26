import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../domain/missions';
import { createInitialSimulation } from './tokenFactory';
import { applyPreparationAction } from './rules/preparation';

describe('deterministic preparation actions', () => {
  it('creates stable token ids for every initial material', () => {
    const first = createInitialSimulation(MISSIONS['salt-recovery']);
    const second = createInitialSimulation(MISSIONS['salt-recovery']);
    expect(first).toEqual(second);
    expect(Object.keys(first.tokens)).toHaveLength(20);
    expect(first.streams.initial.tokenIds[0]).toBe('salt-recovery:salt:01');
  });

  it('adds ten traceable carrier-water tokens and dissolves salt', () => {
    const state = createInitialSimulation(MISSIONS['salt-recovery']);
    const result = applyPreparationAction({
      missionId: 'salt-recovery',
      step: {
        id: 'step-1', actionId: 'add-water', input: { source: 'initial' },
        evidencePropertyId: 'water-solubility', params: {},
      },
      input: state.streams.initial, tokens: state.tokens,
    });
    expect(result.status).toBe('applied');
    expect(result.outputs[0].port).toBe('mixture');
    expect(result.addedTokenIds).toHaveLength(10);
    expect(result.tokens['salt-recovery:carrier-water:01'].origin).toBe('added-carrier');
    expect(result.tokens['salt-recovery:salt:01'].phase).toBe('dissolved');
    expect(result.movements).toHaveLength(20);
    expect(result.movements.every((movement) => !movement.tokenId.includes('carrier-water'))).toBe(true);
  });

  it('waits for water and oil layers without inventing elapsed time', () => {
    const state = createInitialSimulation(MISSIONS['liquid-layers']);
    const result = applyPreparationAction({
      missionId: 'liquid-layers',
      step: {
        id: 'step-1', actionId: 'wait-for-layers', input: { source: 'initial' },
        evidencePropertyId: 'immiscibility', params: {},
      },
      input: state.streams.initial, tokens: state.tokens,
    });
    expect(result.outputs[0].stream.condition.layersSettled).toBe(true);
    expect(result.explanation).not.toMatch(/\d+\s*(분|초)/);
  });

  it('does not settle layers when a third material is present', () => {
    const state = createInitialSimulation(MISSIONS['integrated-process']);
    const result = applyPreparationAction({
      missionId: 'integrated-process',
      step: {
        id: 'step-1', actionId: 'wait-for-layers', input: { source: 'initial' },
        evidencePropertyId: 'immiscibility', params: {},
      },
      input: state.streams.initial, tokens: state.tokens,
    });
    expect(result.status).toBe('no-basis');
    expect(result.reasonCode).toBe('layers-not-settled');
  });
});
