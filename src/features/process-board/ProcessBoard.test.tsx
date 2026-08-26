import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProcessBoardScreen } from './ProcessBoardScreen';

const baseProps = {
  missionId: 'size-sort' as const,
  confirmedPropertyIds: ['particle-size'] as const,
  plan: [],
  initialPlan: null,
  planHistoryDepth: 0,
  attentionActionId: 'prepare-simulation' as const,
  dispatch: vi.fn(),
};

describe('ProcessBoardScreen', () => {
  afterEach(cleanup);
  it('adds a configured method through buttons only', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    render(<ProcessBoardScreen {...baseProps} dispatch={dispatch} />);
    await user.click(screen.getByRole('button', { name: '방법 선택: 체로 분리' }));
    await user.click(screen.getByRole('radio', { name: '중간 간격' }));
    await user.click(screen.getByRole('button', { name: '1단계에 넣기' }));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'add-step',
      step: {
        id: 'step-1',
        actionId: 'sieve',
        input: { source: 'initial' },
        evidencePropertyId: 'particle-size',
        params: { gap: 'medium-gap' },
      },
    });
    expect(document.querySelector('[draggable="true"]')).not.toBeInTheDocument();
  });

  it('disables actions whose property evidence is not confirmed', () => {
    render(
      <ProcessBoardScreen
        {...baseProps}
        missionId="integrated-process"
        confirmedPropertyIds={['particle-size']}
      />,
    );
    expect(screen.getByRole('button', { name: '방법 선택: 체로 분리' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '준비 행동 선택: 물 넣기' })).toBeDisabled();
    expect(screen.getByText(/물과 섞이는 성질을 먼저 확인/)).toBeInTheDocument();
  });

  it('exposes keyboard buttons for replacement, order, undo, and restoration', () => {
    const plan = [
      {
        id: 'step-1',
        actionId: 'sieve' as const,
        input: { source: 'initial' as const },
        evidencePropertyId: 'particle-size' as const,
        params: { gap: 'wide-gap' as const },
      },
    ];
    render(
      <ProcessBoardScreen
        {...baseProps}
        plan={plan}
        initialPlan={plan}
        planHistoryDepth={2}
      />,
    );
    expect(screen.getByRole('button', { name: '1단계 교체' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '실행 취소' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '처음 공정으로 복원' })).toBeEnabled();
  });
});
