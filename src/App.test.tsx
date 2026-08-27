import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('announces the Korean lab purpose and virtual-model boundary', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: '혼합물 분리 공정 설계소' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('실제 실험을 대체하지 않는 가상 공정 시뮬레이션입니다.'),
    ).toBeInTheDocument();
  });
});
