import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OutputPortId } from '../../domain/contracts';
import { MISSIONS } from '../../domain/missions';
import { runProcess } from '../../simulation/runProcess';
import { buildIntegratedPlan } from '../../test/missionBuilders';
import { SimulationScreen } from './SimulationScreen';
import { MISSIONS as ALL_MISSIONS } from '../../domain/missions';

function renderScreen(
  reducedMotion = false,
  completedStepIds: readonly string[] = [],
  predictions: Readonly<Record<string, OutputPortId>> = {},
) {
  const plan = buildIntegratedPlan();
  return render(
    <SimulationScreen
      mission={MISSIONS['integrated-process']}
      plan={plan}
      fullRun={runProcess(MISSIONS['integrated-process'], plan)}
      completedStepIds={completedStepIds}
      predictions={predictions}
      selectedTargetIds={['gravel', 'sand', 'salt']}
      attentionActionId="predict-next-step"
      reducedMotion={reducedMotion}
      dispatch={vi.fn()}
    />,
  );
}

describe('SimulationScreen', () => {
  afterEach(cleanup);
  afterEach(() => vi.useRealTimers());
  it('requires an output prediction before the current step can run', async () => {
    const user = userEvent.setup();
    renderScreen();
    expect(screen.getByRole('button', { name: '1단계 가상 실행' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: '잔류' }));
    expect(screen.queryByText(/자갈은 잔류/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1단계 가상 실행' })).toBeEnabled();
    expect(document.querySelectorAll('[data-attention="true"]')).toHaveLength(1);
  });

  it('shows the exact model boundary and a readable token table', () => {
    renderScreen();
    expect(screen.getByText('가상 실험이며 실제 물질의 양·온도·시간을 측정하지 않습니다')).toBeVisible();
    expect(screen.queryByRole('table', { name: '단계별 물질 토큰 상태' })).not.toBeInTheDocument();
  });

  it('uses two static scenes when reduced motion is requested', () => {
    renderScreen(true, ['step-1'], { 'step-1': 'retained' });
    expect(screen.getByTestId('before-scene')).toBeVisible();
    expect(screen.getByTestId('after-scene')).toBeVisible();
    expect(screen.getByLabelText('전 상태에서 후 상태로')).toBeVisible();
    expect(screen.queryByTestId('moving-token-layer')).not.toBeInTheDocument();
    expect(screen.queryByText('step-1 실행 결과')).not.toBeInTheDocument();
  });

  it('uses a learner-facing label for unchanged predictions', () => {
    renderScreen();
    expect(screen.getByRole('radio', { name: '변화 없음' })).toBeInTheDocument();
    expect(screen.queryByText('unchanged')).not.toBeInTheDocument();
  });

  it('does not approve a wrong lower-layer prediction for an oil target', () => {
    const plan = [{ id: 'step-1', actionId: 'layer-separation', input: { source: 'initial' }, evidencePropertyId: 'immiscibility', params: {} }] as const;
    const run = runProcess(ALL_MISSIONS['liquid-layers'], plan);
    render(<SimulationScreen mission={ALL_MISSIONS['liquid-layers']} plan={plan} fullRun={run} completedStepIds={['step-1']} predictions={{ 'step-1': 'lower' }} selectedTargetIds={['oil']} attentionActionId={null} reducedMotion={false} dispatch={vi.fn()} />);
    expect(screen.queryByText('예측이 목표 물질의 실제 출력과 일치했습니다.')).not.toBeInTheDocument();
    expect(screen.queryByText(/자갈은 잔류/)).not.toBeInTheDocument();
  });

  it('announces movement first and the final movement explanation after 700ms', async () => {
    vi.useFakeTimers();
    renderScreen(false, ['step-1'], { 'step-1': 'retained' });

    expect(screen.getByTestId('moving-token-layer')).toBeInTheDocument();
    expect(screen.getAllByText('1단계 토큰이 이동하고 있습니다.')).toHaveLength(2);
    expect(screen.queryByText('1단계 실행: 자갈 토큰 1개가 잔류로 이동했습니다.')).not.toBeInTheDocument();

    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    expect(screen.queryByTestId('moving-token-layer')).not.toBeInTheDocument();
    expect(screen.getByText('1단계 토큰 이동이 끝났습니다.')).toBeInTheDocument();
    expect(screen.getByText(/1단계 실행:/)).toBeInTheDocument();
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
  });

  it('keeps exactly one shared live region for multiple completed steps', () => {
    renderScreen(true, ['step-1', 'step-2'], { 'step-1': 'retained', 'step-2': 'mixture' });
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
  });

  it('switches a moving scene to static immediately when reduced motion is enabled on rerender', () => {
    const plan = buildIntegratedPlan();
    const mission = MISSIONS['integrated-process'];
    const fullRun = runProcess(mission, plan);
    const props = { mission, plan, fullRun, completedStepIds: ['step-1'] as const, predictions: { 'step-1': 'retained' as OutputPortId }, selectedTargetIds: ['gravel', 'sand', 'salt'] as const, attentionActionId: null, dispatch: vi.fn() };
    const view = render(<SimulationScreen {...props} reducedMotion={false} />);
    expect(screen.getByTestId('moving-token-layer')).toBeInTheDocument();
    view.rerender(<SimulationScreen {...props} reducedMotion />);
    expect(screen.queryByTestId('moving-token-layer')).not.toBeInTheDocument();
    expect(screen.getByLabelText('전 상태에서 후 상태로')).toBeVisible();
  });

  it('uses the completed static announcement immediately for no-basis', () => {
    const plan = [{ id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap: 'fine-gap' } }] as const;
    const mission = ALL_MISSIONS['size-sort'];
    const run = runProcess(mission, plan);
    render(<SimulationScreen mission={mission} plan={plan} fullRun={run} completedStepIds={['step-1']} predictions={{ 'step-1': 'unchanged' }} selectedTargetIds={['sand']} attentionActionId={null} reducedMotion={false} dispatch={vi.fn()} />);
    expect(screen.queryByTestId('moving-token-layer')).not.toBeInTheDocument();
    expect(screen.getByTestId('before-scene')).toBeVisible();
    expect(screen.getByTestId('after-scene')).toBeVisible();
    expect(screen.getByText(/1단계 실행:/)).toBeInTheDocument();
  });
});
