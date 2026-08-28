import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { AppShell } from './components/AppShell';

describe('App', () => {
  it('moves focus to the main content when the learning stage changes', () => {
    const { rerender } = render(<AppShell stage="intake"><p>학습 내용</p></AppShell>);
    rerender(<AppShell stage="properties"><p>성질 분석</p></AppShell>);
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

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
