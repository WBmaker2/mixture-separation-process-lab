import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IntakeScreen } from './IntakeScreen';

describe('IntakeScreen', () => {
  it('offers four missions and a target without asking for a name', async () => {
    const user = userEvent.setup(); const dispatch = vi.fn();
    render(<IntakeScreen missionId={null} selectedTargetIds={[]} attentionActionId="select-mission" dispatch={dispatch} />);
    expect(screen.getAllByRole('radio', { name: /선|관찰조|회수선|통합 공정/ })).toHaveLength(4);
    expect(screen.queryByLabelText(/이름/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /크기 선별선/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'select-mission', missionId: 'size-sort' });
  });
  it('describes each material with name, pattern, and shape', () => {
    render(<IntakeScreen missionId="size-sort" selectedTargetIds={['sand']} attentionActionId={null} dispatch={vi.fn()} />);
    expect(screen.getByLabelText('큰 자갈, 큰 점박이 무늬, 둥근 다각형 모양')).toBeInTheDocument();
    expect(screen.getByLabelText('고운 모래, 잔점 무늬, 작은 원 모양')).toBeInTheDocument();
  });
});
