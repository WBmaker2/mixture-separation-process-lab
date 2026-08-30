import { describe, expect, it } from 'vitest';
import { STAGE_COPY } from './learningCopy';

describe('STAGE_COPY', () => {
  it('defines readable next actions for all seven learning stages', () => {
    expect(Object.keys(STAGE_COPY)).toHaveLength(7);
    Object.values(STAGE_COPY).forEach((copy) => {
      expect(copy.eyebrow.trim()).not.toBe('');
      expect(copy.title.trim()).not.toBe('');
      expect(copy.description.trim()).not.toBe('');
      expect(copy.nextAction.trim()).not.toBe('');
    });
  });
});
