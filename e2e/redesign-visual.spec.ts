import { test, expect } from '@playwright/test';

test.describe('education redesign visual contracts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows the learner journey and one primary action after a mission is ready', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: '학습 단계' })).toBeVisible();
    await expect(page.getByText('지금 할 일').first()).toBeVisible();
    await page.getByRole('radio', { name: /크기 선별선/ }).check();
    await page.getByRole('radio', { name: /고운 모래/ }).last().check();
    await expect(page.locator('[data-attention="true"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: '성질 분석실로' })).toHaveAttribute('data-attention', 'true');
  });

  test('does not overflow a 375px learner viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
});
