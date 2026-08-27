import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MISSIONS } from '../../domain/missions';
import { buildIntegratedPlan } from '../../test/missionBuilders';
import { ReportScreen } from './ReportScreen';

describe('ReportScreen', () => {
  afterEach(cleanup);
  it('shows the initial and revised integrated processes with the revision evidence', () => {
    render(<ReportScreen mission={MISSIONS['integrated-process']} selectedTargetIds={['gravel', 'sand', 'salt']} initialPlan={buildIntegratedPlan('wide-gap')} revisedPlan={buildIntegratedPlan('medium-gap')} revisionReason="중간 간격 체도 크기 차이를 이용해 자갈과 모래를 나눌 수 있기 때문입니다." sustainabilityReflection="필요한 물질을 다시 회수하면 자원을 덜 버리는 생활에 이어질 수 있습니다." quality={null} onSustainabilityChange={vi.fn()} onPrint={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByRole('heading', { name: '최초 공정' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '수정 공정' })).toBeVisible();
    expect(screen.getAllByText('준비 행동')).toHaveLength(2);
    expect(screen.getByText(/중간 간격 체도 크기 차이/)).toBeVisible();
    expect(screen.getByLabelText('생활 속 분리 기술과 지속가능한 생활에 이 공정이 어떻게 이어질까요?')).toHaveValue('필요한 물질을 다시 회수하면 자원을 덜 버리는 생활에 이어질 수 있습니다.');
    expect(screen.queryByLabelText(/학생 이름|이름/)).not.toBeInTheDocument();
  });

  it('calls the supplied print action', async () => {
    const user = userEvent.setup(); const onPrint = vi.fn();
    render(<ReportScreen mission={MISSIONS['size-sort']} selectedTargetIds={['sand']} initialPlan={buildIntegratedPlan().slice(0, 1)} revisedPlan={null} revisionReason="첫 공정에서 크기 차이를 이용해 목표를 회수했습니다." sustainabilityReflection="분리한 물질을 다시 쓰면 버리는 양을 줄일 수 있습니다." quality={null} onSustainabilityChange={vi.fn()} onPrint={onPrint} onReset={vi.fn()} />);
    const printButton = screen.getByRole('button', { name: '설계 보고서 인쇄' });
    expect(printButton).toHaveClass('gi-pulse');
    expect(screen.getByRole('heading', { name: /체로 분리/ })).toBeVisible();
    expect(screen.getByText('첫 공정으로 학습 조건을 충족했습니다.')).toBeVisible();
    expect(screen.getByRole('heading', { name: '완료 근거' })).toBeVisible();
    expect(screen.getByText('첫 공정에서 크기 차이를 이용해 목표를 회수했습니다.')).toBeVisible();
    await user.click(printButton); expect(onPrint).toHaveBeenCalledOnce();
  });
});
