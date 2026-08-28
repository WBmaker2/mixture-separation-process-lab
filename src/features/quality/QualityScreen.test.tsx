import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MISSIONS } from '../../domain/missions';
import { runProcess } from '../../simulation/runProcess';
import { buildIntegratedPlan } from '../../test/missionBuilders';
import { computeQuality } from '../../simulation/quality';
import { QualityScreen } from './QualityScreen';

describe('QualityScreen', () => {
  afterEach(cleanup);
  it('requires stream claims and labels every value as an educational token count', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const mission = MISSIONS['integrated-process'];
    const run = runProcess(mission, buildIntegratedPlan());
    render(<QualityScreen mission={mission} run={run} attempt="initial" confirmedPropertyIds={mission.requiredPropertyIds} claims={[]} attentionActionId="inspect-quality" dispatch={dispatch} />);
    expect(screen.getByText(/실제 질량·순도·수율이 아닌 교육용 토큰/)).toBeVisible();
    await user.selectOptions(screen.getByLabelText('큰 자갈 회수 물질함'), 'step-1:retained');
    expect(dispatch).toHaveBeenCalledWith({ type: 'set-recovery-claim', claim: { materialId: 'gravel', streamId: 'step-1:retained' } });
  });

  it('shows all four quality categories and a guiding question', () => {
    const mission = MISSIONS['integrated-process'];
    const run = runProcess(mission, buildIntegratedPlan());
    render(<QualityScreen mission={mission} run={run} attempt="initial" confirmedPropertyIds={mission.requiredPropertyIds} claims={[{ materialId: 'gravel', streamId: 'step-1:retained' }, { materialId: 'sand', streamId: 'step-3:filter-residue' }, { materialId: 'salt', streamId: 'step-4:solid-residue' }]} attentionActionId="revise-process" dispatch={vi.fn()} />);
    expect(screen.getByRole('columnheader', { name: '회수' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '섞여 남음' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '미회수' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '손실' })).toBeInTheDocument();
    expect(screen.getByText(/\?$/)).toBeVisible();
  });

  it('focuses the guiding question on the lost target in an integrated run', () => {
    const mission = MISSIONS['integrated-process'];
    const run = runProcess(mission, buildIntegratedPlan());
    render(<QualityScreen mission={mission} run={run} attempt="initial" confirmedPropertyIds={mission.requiredPropertyIds} selectedTargetIds={['gravel', 'sand', 'salt']} claims={[{ materialId: 'gravel', streamId: 'step-1:retained' }, { materialId: 'sand', streamId: 'step-3:filter-residue' }, { materialId: 'salt', streamId: 'step-4:solid-residue' }]} attentionActionId="inspect-quality" dispatch={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('소금');
    expect(screen.getByRole('status')).not.toHaveTextContent('큰 자갈만');
  });

  it('starts revision without displaying an answer sequence', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const mission = MISSIONS['salt-recovery'];
    const run = runProcess(mission, []);
    render(<QualityScreen mission={mission} run={run} attempt="initial" confirmedPropertyIds={[]} claims={[]} attentionActionId="revise-process" dispatch={dispatch} />);
    expect(screen.queryByText(/정답 공정|정답 순서/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '문제 단계 수정하기' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'begin-revision' });
  });

  it('fails closed for consumed and unknown recovery streams', () => {
    const mission = MISSIONS['integrated-process'];
    const run = runProcess(mission, buildIntegratedPlan());
    expect(computeQuality(run, [{ materialId: 'gravel', streamId: 'initial' }], ['gravel']).byTarget.gravel?.claimedStreamId).toBeNull();
    expect(computeQuality(run, [{ materialId: 'gravel', streamId: 'made-up' }], ['gravel']).byTarget.gravel?.claimedStreamId).toBeNull();
  });
});
