import { test, expect } from '@playwright/test';
async function activate(page: import('@playwright/test').Page, name: string) { const button = page.getByRole('button', { name }); await button.focus(); await button.press('Enter'); }

test.describe('로컬 전용·개인정보·안전 경계', () => {
  test('외부 요청과 학생 식별 입력 없이 가상·안전 문구를 제공한다', async ({ page }) => {
    const external: string[] = [];
    const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
    await page.goto('/');
    await expect(page.getByText(/가상 공정 시뮬레이션/)).toBeVisible();
    await expect(page.getByText(/교사의 안전 지도/)).toBeVisible();
    await expect(page.getByLabel(/학생 이름|실명|이메일/i)).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/실제 (질량|순도|수율|온도|시간|부피)을 측정/);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('미션과 성질 분석실 상태를 재로드 뒤 복원한다', async ({ page }) => {
    await page.goto('/'); await page.evaluate(() => localStorage.clear());
    await page.getByRole('radio', { name: /크기 선별선/ }).check(); await page.getByRole('radio', { name: /^고운 모래,/ }).check();
    await activate(page, '성질 분석실로'); await page.reload();
    await expect(page.getByRole('heading', { name: '성질 분석실' })).toBeVisible();
  });
});
