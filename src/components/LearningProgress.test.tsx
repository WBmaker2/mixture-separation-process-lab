import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LearningProgress } from './LearningProgress';

describe('LearningProgress', () => {
  it('shows one current stage, completed stages, and locked stages', () => {
    render(<LearningProgress stage="design" />);
    expect(screen.getByRole('navigation', { name: '학습 단계' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('공정 설계');
    expect(screen.getAllByText('완료')).toHaveLength(2);
    expect(screen.getAllByText('아직 열리지 않음')).toHaveLength(4);
  });
});
