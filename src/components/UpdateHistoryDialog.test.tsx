import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { UpdateHistoryDialog } from './UpdateHistoryDialog';
describe('UpdateHistoryDialog', () => {
  it('opens from the small fixed button and exposes dated entries', async () => {
    const user = userEvent.setup(); render(<UpdateHistoryDialog />); const trigger = screen.getByRole('button', { name: '업데이트 내역' });
    expect(trigger).toHaveClass('update-history-trigger'); await user.click(trigger);
    expect(screen.getByRole('dialog', { name: '업데이트 내역' })).toBeVisible(); expect(screen.getByText('2026-08-26 · 설계')).toBeVisible(); expect(screen.getByText('최초 설계 문서 작성')).toBeVisible(); expect(screen.getByText('2026-08-26 · 개발')).toBeVisible(); expect(screen.getByText('MVP 구현 및 과학·안전 문구 검수')).toBeVisible();
    expect(screen.getByText('2026-08-27 · 개선')).toBeVisible(); expect(screen.getByText('보고서 모바일 여백·공정 유형·인쇄 강조 보완')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '업데이트 내역 닫기' })); expect(trigger).toHaveFocus();
  });
});
