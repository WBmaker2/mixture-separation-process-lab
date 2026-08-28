import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PropertyLabScreen } from './PropertyLabScreen';

describe('PropertyLabScreen', () => {
  it('shows only mission actions and keeps selection on the process board', async () => {
    const user = userEvent.setup(); const dispatch = vi.fn();
    const { rerender } = render(<PropertyLabScreen missionId="size-sort" confirmedPropertyIds={[]} attentionActionId="confirm-properties" dispatch={dispatch} />);
    expect(screen.getByRole('heading', { name: '체로 분리' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '거르기' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '체로 분리' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('status', { name: '' })).toHaveLength(1);
    expect(screen.queryByText('solid')).not.toBeInTheDocument();
    expect(screen.queryByText('particle-size')).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /알갱이 크기/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'toggle-property', propertyId: 'particle-size' });
    rerender(<PropertyLabScreen missionId="size-sort" confirmedPropertyIds={['particle-size']} attentionActionId="confirm-properties" dispatch={dispatch} />);
    expect(screen.getByRole('status')).toHaveTextContent('공정 설계판에서 방법을 선택할 수 있어요.');
    expect(document.querySelectorAll('[data-attention="true"]')).toHaveLength(1);
  });
});
