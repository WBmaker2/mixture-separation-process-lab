import { describe, expect, it } from 'vitest';
import { ACTIONS } from './actions';
import { MATERIALS } from './materials';
import { MISSIONS } from './missions';
import { PROPERTIES } from './properties';
import { SAFETY_COPY } from '../content/safety';

describe('learning content contract', () => {
  it('contains four missions, four methods, and two preparation actions', () => {
    expect(Object.keys(MISSIONS)).toHaveLength(4);
    expect(Object.values(ACTIONS).filter((item) => item.kind === 'method')).toHaveLength(4);
    expect(Object.values(ACTIONS).filter((item) => item.kind === 'preparation')).toHaveLength(2);
  });

  it('gives every material non-color cues and educational properties', () => {
    expect(Object.keys(MATERIALS)).toEqual(['gravel', 'sand', 'salt', 'water', 'oil']);
    for (const material of Object.values(MATERIALS)) {
      expect(material.name).not.toBe('');
      expect(material.patternLabel).not.toBe('');
      expect(material.shapeLabel).not.toBe('');
      expect(material.properties).toBeDefined();
    }
  });

  it('defines all five property cards with a question and evidence sentence', () => {
    expect(Object.keys(PROPERTIES)).toEqual([
      'particle-size',
      'immiscibility',
      'water-solubility',
      'filter-behavior',
      'evaporation-residue',
    ]);
    for (const property of Object.values(PROPERTIES)) {
      expect(property.question.endsWith('?')).toBe(true);
      expect(property.evidenceSentence).toContain('때문');
    }
  });

  it('keeps the integrated mission focused on all three recoveries', () => {
    expect(MISSIONS['integrated-process'].goal).toEqual({
      mode: 'all-components',
      selectableTargets: [],
      requiredTargets: ['gravel', 'sand', 'salt'],
    });
  });

  it('states the virtual-model and teacher-safety boundaries without procedure values', () => {
    expect(SAFETY_COPY.measurementBoundary).toBe(
      '가상 실험이며 실제 물질의 양·온도·시간을 측정하지 않습니다',
    );
    expect(SAFETY_COPY.teacherGuidance).toContain('교사의 안전 지도');
    expect(Object.values(SAFETY_COPY).join(' ')).not.toMatch(/\d+\s*(분|초|℃|°C|mL|g)\b/);
  });
});
