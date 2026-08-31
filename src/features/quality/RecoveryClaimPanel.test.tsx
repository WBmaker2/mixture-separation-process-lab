import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MISSIONS } from '../../domain/missions';
import { runProcess } from '../../simulation/runProcess';
import { RecoveryClaimPanel } from './RecoveryClaimPanel';

describe('RecoveryClaimPanel', () => {
  afterEach(cleanup);

  it('keeps stream choices short and exposes selected token contents separately', async () => {
    const user = userEvent.setup();
    const mission = MISSIONS['size-sort'];
    const run = runProcess(mission, [{ id: 'step-1', actionId: 'sieve', input: { source: 'initial' }, evidencePropertyId: 'particle-size', params: { gap: 'medium-gap' } }]);
    const { rerender } = render(<RecoveryClaimPanel mission={mission} run={run} claims={[]} targetIds={['sand']} dispatch={vi.fn()} />);

    const select = screen.getByLabelText('고운 모래 회수 물질함');
    expect(screen.getByRole('option', { name: '1단계 · 통과 물질함' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1단계 · 잔류 물질함' })).toBeInTheDocument();
    expect(screen.queryByText(/step-1/)).not.toBeInTheDocument();
    expect(screen.getByText('아직 물질함을 고르지 않았어요.')).toBeVisible();

    await user.selectOptions(select, 'step-1:pass');
    rerender(<RecoveryClaimPanel mission={mission} run={run} claims={[{ materialId: 'sand', streamId: 'step-1:pass' }]} targetIds={['sand']} dispatch={vi.fn()} />);
    expect(screen.getByText('선택한 물질함의 토큰: 고운 모래 9개')).toBeVisible();
    expect(select).toHaveAttribute('aria-describedby', 'claim-sand-help');
  });
});
