import { describe, expect, it } from 'vitest';
import type { ProcessOutcome } from './contracts';
import { formatMovementAnnouncement, formatMovementGroupExplanation, groupMovements } from './movementCopy';

const outcome: ProcessOutcome = {
  stepId: 'step-1', actionId: 'sieve', status: 'applied', reasonCode: null, explanation: '내부 설명',
  tokens: {
    gravel: { id: 'gravel', materialId: 'gravel', origin: 'initial', phase: 'solid' },
    sand: { id: 'sand', materialId: 'sand', origin: 'initial', phase: 'solid' },
  }, outputs: [], addedTokenIds: [], lostTokenIds: [],
  movements: [
    { tokenId: 'gravel', stepId: 'step-1', fromStreamId: 'initial', toStreamId: 'step-1:retained', reason: 'particle-size' },
    { tokenId: 'sand', stepId: 'step-1', fromStreamId: 'initial', toStreamId: 'step-1:pass', reason: 'particle-size' },
  ],
};

describe('movement copy', () => {
  it('uses natural destination particles', () => {
    const announcement = formatMovementAnnouncement(outcome);
    expect(announcement).toContain('잔류로');
    expect(announcement).not.toContain('잔류으로');
    expect(formatMovementAnnouncement({ ...outcome, movements: [{ ...outcome.movements[0], toStreamId: 'step-1:filtrate' }] })).toContain('거른 액체로');
    expect(formatMovementAnnouncement({ ...outcome, movements: [{ ...outcome.movements[0], toStreamId: 'loss' }] })).toContain('교육용 손실로');
    expect(announcement.match(/그리고/g)?.length ?? 0).toBe(1);
  });

  it('keeps explanations specific to each material group', () => {
    const groups = groupMovements(outcome);
    expect(groups).toHaveLength(2);
    expect(formatMovementGroupExplanation(groups[0])).not.toContain('모래');
    expect(formatMovementGroupExplanation(groups[1])).not.toContain('자갈');
  });
});
