import { expect, test } from '@playwright/test';

test('replaces movement and pulse animation when reduced motion is enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const mission = page.getByRole('radio', { name: /크기 선별선/ });
  await mission.focus(); await page.keyboard.press('Space');
  const target = page.locator('input[name="target"]').first();
  await target.focus(); await page.keyboard.press('Space');
  await expect(page.locator('[data-attention="true"]')).toHaveCount(1);
  expect(await page.locator('[data-attention="true"]').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await page.getByRole('button', { name: '성질 분석실로' }).focus(); await page.keyboard.press('Enter');
  const property = page.getByRole('checkbox', { name: /알갱이 크기/ }); await property.focus(); await page.keyboard.press('Space');
  await page.getByRole('button', { name: '공정 설계판으로' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '방법 선택: 체로 분리' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('radio', { name: '중간 간격' }).focus(); await page.keyboard.press('Space');
  await page.getByRole('button', { name: '1단계에 넣기' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '가상 실행 준비' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('radio', { name: /통과/ }).first().focus(); await page.keyboard.press('Space');
  await page.getByRole('button', { name: '1단계 가상 실행' }).focus(); await page.keyboard.press('Enter');
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('mixture-separation-process-lab:v1') ?? '{}'));
  expect(persisted.currentRun).not.toBeNull();
  await page.reload();
  await expect(page.getByTestId('before-scene')).toBeVisible();
  await expect(page.getByTestId('after-scene')).toBeVisible();
  await expect(page.getByTestId('moving-token-layer')).toHaveCount(0);
});
