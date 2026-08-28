import { describe, expect, it } from 'vitest';
import { materialPropertyValueLabel, outputPortLabel, propertyEvidenceLabel, streamLocationLabel } from './displayLabels';

describe('learner-facing display labels', () => {
  it('translates stored property values without exposing ids', () => {
    expect(materialPropertyValueLabel('state', 'solid')).toBe('고체');
    expect(materialPropertyValueLabel('particleSize', 'large')).toBe('큰 알갱이');
    expect(materialPropertyValueLabel('particleSize', 'fine')).toBe('고운 알갱이');
    expect(materialPropertyValueLabel('particleSize', 'not-applicable')).toBe('해당 없음');
    expect(materialPropertyValueLabel('waterRelationship', 'does-not-mix')).toBe('물과 섞이지 않음');
    expect(materialPropertyValueLabel('waterSolubility', 'dissolves')).toBe('물에 녹음');
    expect(materialPropertyValueLabel('afterVirtualEvaporation', 'solid-remains')).toBe('고체로 남음');
    expect(materialPropertyValueLabel('afterVirtualEvaporation', 'carrier-removed')).toBe('운반 물질이 이동함');
    expect(materialPropertyValueLabel('state', 'unknown-value')).toBe('교육용 정보');
  });

  it('translates property, port, and stream ids', () => {
    expect(propertyEvidenceLabel('particle-size')).toBe('알갱이 크기');
    expect(outputPortLabel('filter-residue')).toBe('거름 찌꺼기');
    expect(streamLocationLabel('step-1:retained')).toBe('1단계의 잔류 물질');
    expect(streamLocationLabel('unknown-stream')).not.toContain('unknown-stream');
  });
});
