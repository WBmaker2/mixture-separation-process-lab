import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PropertyLabScreen } from './PropertyLabScreen';

describe('PropertyLabScreen', () => {
  it('keeps filtration disabled until both properties are confirmed', async () => {
    const user = userEvent.setup(); const dispatch = vi.fn();
    const { rerender } = render(<PropertyLabScreen missionId="size-sort" confirmedPropertyIds={[]} attentionActionId="confirm-properties" dispatch={dispatch} />);
    expect(screen.queryByText('solid')).not.toBeInTheDocument();
    expect(screen.queryByText('particle-size')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '거르기' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: /알갱이 크기/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'toggle-property', propertyId: 'particle-size' });
    rerender(<PropertyLabScreen missionId="size-sort" confirmedPropertyIds={['particle-size']} attentionActionId="confirm-properties" dispatch={dispatch} />);
    expect(screen.getByRole('button', { name: '거르기' })).toBeDisabled();
    expect(document.querySelectorAll('[data-attention="true"]')).toHaveLength(1);
  });
});
