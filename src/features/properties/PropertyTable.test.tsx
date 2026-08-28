import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PropertyTable } from './PropertyTable';

describe('PropertyTable', () => {
  it('renders learner labels and responsive data-labels for every property cell', () => {
    render(<PropertyTable materialIds={['sand', 'oil']} />);

    expect(screen.getByRole('table', { name: '미션 물질 성질표' })).toBeInTheDocument();
    expect(screen.getByText('고운 모래')).toBeInTheDocument();
    expect(screen.getByText('액체')).toBeInTheDocument();
    expect(screen.getByText('물과 섞이지 않음')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(6);
    expect(screen.getAllByRole('cell')[0]).toHaveAttribute('data-label', '상태');
    expect(screen.getAllByRole('cell')[1]).toHaveAttribute('data-label', '알갱이');
    expect(screen.getAllByRole('cell')[2]).toHaveAttribute('data-label', '물과의 관계');
  });
});
