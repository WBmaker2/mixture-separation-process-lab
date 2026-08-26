import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OutputPortId } from '../../domain/contracts';
import { MISSIONS } from '../../domain/missions';
import { runProcess } from '../../simulation/runProcess';
import { buildIntegratedPlan } from '../../test/missionBuilders';
import { SimulationScreen } from './SimulationScreen';

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
      attentionActionId="predict-next-step"
      reducedMotion={reducedMotion}
      dispatch={vi.fn()}
    />,
  );
}

describe('SimulationScreen', () => {
  afterEach(cleanup);
  it('requires an output prediction before the current step can run', async () => {
    const user = userEvent.setup();
    renderScreen();
    expect(screen.getByRole('button', { name: '1단계 가상 실행' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: /자갈은 잔류/ }));
    expect(screen.getByRole('button', { name: '1단계 가상 실행' })).toBeEnabled();
    expect(document.querySelectorAll('[data-attention="true"]')).toHaveLength(1);
  });

  it('shows the exact model boundary and a readable token table', () => {
    renderScreen();
    expect(screen.getByText('가상 실험이며 실제 물질의 양·온도·시간을 측정하지 않습니다')).toBeVisible();
    expect(screen.getByRole('table', { name: '단계별 물질 토큰 상태' })).toBeInTheDocument();
  });

  it('uses two static scenes when reduced motion is requested', () => {
    renderScreen(true, ['step-1'], { 'step-1': 'retained' });
    expect(screen.getByTestId('before-scene')).toBeVisible();
    expect(screen.getByTestId('after-scene')).toBeVisible();
    expect(screen.getByLabelText('전 상태에서 후 상태로')).toBeVisible();
    expect(screen.queryByTestId('moving-token-layer')).not.toBeInTheDocument();
  });
});
