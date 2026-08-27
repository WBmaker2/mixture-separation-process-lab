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
    expect(screen.getByRole('alert')).toHaveTextContent(/물에 녹는 성질/);
    expect(screen.getByRole('alert')).toHaveAttribute('tabindex', '0');
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

  it('keeps replacement id and original input while excluding future inputs', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const plan = [
      { id: 'step-1', actionId: 'sieve' as const, input: { source: 'initial' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } },
      { id: 'step-2', actionId: 'sieve' as const, input: { source: 'step' as const, stepId: 'step-1', port: 'pass' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } },
    ];
    render(<ProcessBoardScreen {...baseProps} plan={plan} dispatch={dispatch} />);
    await user.click(screen.getByRole('button', { name: '1단계 교체' }));
    expect(screen.queryByLabelText('3단계 입력: 통과 물질')).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '중간 간격' }));
    await user.click(screen.getByRole('button', { name: '교체하기' }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'replace-step', stepId: 'step-1', replacement: expect.objectContaining({ id: 'step-1', input: { source: 'initial' } }) }));
  });

  it('marks future and deleted stream references with a focusable warning', () => {
    const plan = [
      { id: 'step-1', actionId: 'sieve' as const, input: { source: 'step' as const, stepId: 'step-2', port: 'pass' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } },
      { id: 'step-2', actionId: 'sieve' as const, input: { source: 'initial' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } },
    ];
    render(<ProcessBoardScreen {...baseProps} plan={plan} />);
    const warning = screen.getAllByRole('alert').find((node) => node.textContent?.includes('앞 단계 출력 연결을 다시 선택하세요'));
    expect(warning).toHaveAttribute('tabindex', '0');
  });

  it('keeps replacement mode when selecting a different allowed action', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const plan = [{ id: 'step-1', actionId: 'sieve' as const, input: { source: 'initial' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } }];
    render(<ProcessBoardScreen missionId="integrated-process" confirmedPropertyIds={['particle-size', 'water-solubility', 'filter-behavior', 'evaporation-residue']} plan={plan} initialPlan={null} planHistoryDepth={0} attentionActionId="prepare-simulation" dispatch={dispatch} />);
    await user.click(screen.getByRole('button', { name: '1단계 교체' }));
    await user.click(screen.getByRole('button', { name: '준비 행동 선택: 물 넣기' }));
    await user.click(screen.getByRole('button', { name: '교체하기' }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'replace-step', stepId: 'step-1', replacement: expect.objectContaining({ id: 'step-1', actionId: 'add-water', input: { source: 'initial' } }) }));
  });

  it('uses filtration evidence for both new and replacement steps', async () => {
    const user = userEvent.setup();
    const confirmedPropertyIds = ['particle-size', 'water-solubility', 'filter-behavior', 'evaporation-residue'] as const;
    const dispatch = vi.fn();
    const { unmount } = render(
      <ProcessBoardScreen
        {...baseProps}
        missionId="integrated-process"
        confirmedPropertyIds={confirmedPropertyIds}
        dispatch={dispatch}
      />,
    );

    await user.click(screen.getByRole('button', { name: '방법 선택: 거르기' }));
    await user.click(screen.getByRole('button', { name: '1단계에 넣기' }));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'add-step',
      step: {
        id: 'step-1',
        actionId: 'filtration',
        input: { source: 'initial' },
        evidencePropertyId: 'filter-behavior',
        params: {},
      },
    });
    unmount();

    dispatch.mockClear();
    render(
      <ProcessBoardScreen
        {...baseProps}
        missionId="integrated-process"
        confirmedPropertyIds={confirmedPropertyIds}
        plan={[{ id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap: 'wide-gap' } }]}
        dispatch={dispatch}
      />,
    );
    await user.click(screen.getByRole('button', { name: '1단계 교체' }));
    await user.click(screen.getByRole('button', { name: '방법 선택: 거르기' }));
    await user.click(screen.getByRole('button', { name: '교체하기' }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'replace-step',
      stepId: 'step-1',
      replacement: expect.objectContaining({ actionId: 'filtration', evidencePropertyId: 'filter-behavior' }),
    }));
  });

  it('labels second-step inputs with target and source step numbers', async () => {
    const user = userEvent.setup();
    const plan = [{ id: 'step-1', actionId: 'sieve' as const, input: { source: 'initial' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } }];
    render(<ProcessBoardScreen {...baseProps} plan={plan} />);
    await user.click(screen.getByRole('button', { name: '방법 선택: 체로 분리' }));
    expect(screen.getByRole('radio', { name: '2단계 입력: 1단계의 통과 물질' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /3단계 입력/ })).not.toBeInTheDocument();
  });

  it('shows connectors only between adjacent preview steps', () => {
    const plan = [
      { id: 'step-1', actionId: 'sieve' as const, input: { source: 'initial' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } },
      { id: 'step-2', actionId: 'sieve' as const, input: { source: 'step' as const, stepId: 'step-1', port: 'pass' as const }, evidencePropertyId: 'particle-size' as const, params: { gap: 'wide-gap' as const } },
    ];
    render(<ProcessBoardScreen {...baseProps} plan={plan} />);
    expect(screen.getAllByTestId('preview-connector')).toHaveLength(1);
    expect(screen.getAllByText(/체로 분리/).length).toBeGreaterThanOrEqual(2);
    const preview = screen.getByRole('heading', { name: '공정 미리보기' }).parentElement?.querySelector('ol');
    expect(preview?.children).toHaveLength(2);
    expect([...((preview?.children ?? []) as HTMLCollectionOf<HTMLElement>)].every((child) => child.tagName === 'LI')).toBe(true);
  });

  it('shows only action-relevant missing property guidance', () => {
    render(<ProcessBoardScreen {...baseProps} confirmedPropertyIds={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/알갱이 크기/);
    expect(screen.getByRole('alert')).not.toHaveTextContent(/물과 섞이는/);
  });
});
