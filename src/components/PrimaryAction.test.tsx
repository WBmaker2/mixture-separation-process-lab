import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrimaryAction } from './PrimaryAction';

describe('PrimaryAction', () => {
  it('marks only attention actions and keeps the stable pulse class on the button', () => {
    render(<><PrimaryAction attention>다음 단계</PrimaryAction><PrimaryAction attention={false}>보조</PrimaryAction></>);
    const primary = screen.getByRole('button', { name: '다음 단계' });
    expect(primary).toHaveClass('gi-pulse');
    expect(primary).toHaveAttribute('data-attention', 'true');
    expect(screen.getByRole('button', { name: '보조' })).not.toHaveClass('gi-pulse');
  });
});
