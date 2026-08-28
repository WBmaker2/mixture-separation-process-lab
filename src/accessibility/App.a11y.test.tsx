import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from '../components/AppShell';
import { IntakeScreen } from '../features/intake/IntakeScreen';
import { PropertyLabScreen } from '../features/properties/PropertyLabScreen';
import { ProcessBoardScreen } from '../features/process-board/ProcessBoardScreen';
import { MISSIONS } from '../domain/missions';
import { buildIntegratedPlan } from '../test/missionBuilders';
import { runProcess } from '../simulation/runProcess';
import { SimulationScreen } from '../features/simulation/SimulationScreen';
import { QualityScreen } from '../features/quality/QualityScreen';
import { ReportScreen } from '../features/report/ReportScreen';
import { UpdateHistoryDialog } from '../components/UpdateHistoryDialog';

expect.extend(toHaveNoViolations);
const dispatch = vi.fn();

describe('screen reader contracts', () => {
  it('provides a keyboard skip link to the main learning content', () => {
    render(<AppShell stage="intake"><p>학습 내용</p></AppShell>);
    expect(screen.getByRole('link', { name: '본문으로 건너뛰기' })).toHaveAttribute('href', '#main-content');
  });

  it('has no automated violations across learner screens', async () => {
    const mission = MISSIONS['integrated-process'];
    const plan = buildIntegratedPlan();
    const run = runProcess(mission, plan);
    const views = [
      <IntakeScreen missionId="size-sort" selectedTargetIds={['sand']} attentionActionId={null} dispatch={dispatch} />,
      <PropertyLabScreen missionId="size-sort" confirmedPropertyIds={['particle-size']} attentionActionId={null} dispatch={dispatch} />,
      <ProcessBoardScreen missionId="size-sort" confirmedPropertyIds={['particle-size']} plan={[]} initialPlan={null} planHistoryDepth={0} attentionActionId={null} dispatch={dispatch} />,
      <SimulationScreen mission={mission} plan={plan} fullRun={run} completedStepIds={[]} predictions={{}} selectedTargetIds={['gravel', 'sand', 'salt']} attentionActionId="predict-next-step" reducedMotion dispatch={dispatch} />,
      <QualityScreen mission={mission} run={run} attempt="initial" confirmedPropertyIds={mission.requiredPropertyIds} claims={[]} attentionActionId="inspect-quality" dispatch={dispatch} />,
      <ReportScreen mission={mission} selectedTargetIds={mission.goal.requiredTargets} initialPlan={plan} revisedPlan={null} revisionReason="" sustainabilityReflection="" quality={null} onSustainabilityChange={vi.fn()} onPrint={vi.fn()} onReset={vi.fn()} />,
      <UpdateHistoryDialog />,
    ];
    for (const view of views) {
      const { container, unmount } = render(view);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
