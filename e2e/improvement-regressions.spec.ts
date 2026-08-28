import { expect, test, type Page } from '@playwright/test';

async function clickPrimary(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name });
  await button.scrollIntoViewIfNeeded();
  const before = await button.boundingBox();
  expect(before).not.toBeNull();
  const center = { x: before!.x + before!.width / 2, y: before!.y + before!.height / 2 };
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  await page.waitForTimeout(100);
  const during = await button.boundingBox();
  expect(during).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(during![key] - before![key])).toBeLessThanOrEqual(1);
  await page.mouse.up();
}

test.describe('Task 7 learner regressions', () => {
  test('mouse activation remains stable at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('./');
    await page.getByRole('radio', { name: /크기 선별선/ }).check();
    await page.getByRole('radio', { name: /고운 모래/ }).last().check();
    await clickPrimary(page, '성질 분석실로');
    await expect(page.getByRole('heading', { name: '성질 분석실' })).toBeVisible();
  });

  test('evaluates a prediction for the selected oil target', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('radio', { name: /두 액체 관찰조/ }).check();
    await page.getByRole('radio', { name: /식용유 모형/ }).last().check();
    await clickPrimary(page, '성질 분석실로');
    await page.getByRole('checkbox', { name: /서로 섞이지 않음/ }).check();
    await clickPrimary(page, '공정 설계판으로');
    await page.getByRole('button', { name: /준비 행동 선택: 층 기다리기/ }).click();
    await page.getByRole('button', { name: '1단계에 넣기' }).click();
    await page.getByRole('button', { name: /방법 선택: 층 분리/ }).click();
    await page.getByRole('radio', { name: /1단계.*층이 생긴 물질함/ }).check();
    await page.getByRole('button', { name: '2단계에 넣기' }).click();
    await clickPrimary(page, '가상 실행 준비');
    await page.getByRole('radio', { name: '층이 생긴 물질함', exact: true }).check();
    await clickPrimary(page, '1단계 가상 실행');
    await expect(page.getByText(/식용유 모형 토큰은 어느 출력에 있을까요/)).toBeVisible();
    await page.getByRole('radio', { name: '아래층', exact: true }).check();
    await clickPrimary(page, '2단계 가상 실행');
    await expect(page.locator('.simulation-preview').last()).not.toContainText('예측이 목표 물질의 실제 출력과 일치했습니다.');
    await expect(page.locator('body')).toContainText('예측과 실제 출력을 비교해 보세요.');
  });

  test('keeps learner copy free of internal identifiers', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('radio', { name: /크기 선별선/ }).check();
    await page.getByRole('radio', { name: /고운 모래/ }).last().check();
    await clickPrimary(page, '성질 분석실로');
    await expect(page.locator('body')).not.toContainText(/particle-size|solid|filter-behavior|잔류으로/);
    await page.getByRole('checkbox', { name: /알갱이 크기/ }).check();
    await clickPrimary(page, '공정 설계판으로');
    await page.getByRole('button', { name: /방법 선택: 체로 분리/ }).click();
    await page.getByRole('radio', { name: '중간 간격', exact: true }).check();
    await page.getByRole('button', { name: '1단계에 넣기' }).click();
    await clickPrimary(page, '가상 실행 준비');
    await page.getByRole('radio', { name: '통과', exact: true }).check();
    await clickPrimary(page, '1단계 가상 실행');
    await expect(page.getByRole('table', { name: '단계별 물질 토큰 상태' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/particle-size|solid|filter-behavior|잔류으로/);
  });

  test('fits property table and footer controls on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('./');
    await page.getByRole('radio', { name: /크기 선별선/ }).check();
    await page.getByRole('radio', { name: /고운 모래/ }).last().check();
    await clickPrimary(page, '성질 분석실로');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    await expect(page.locator('.property-table td')).not.toHaveCount(0);
    const missingLabels = await page.locator('.property-table td').evaluateAll((cells) => cells.filter((cell) => !cell.getAttribute('data-label')).length);
    expect(missingLabels).toBe(0);
    const footer = await page.locator('.app-footer').boundingBox();
    const safety = await page.locator('.safety-notice').last().boundingBox();
    expect(footer && safety && footer.y >= safety.y + safety.height).toBeTruthy();
  });

  test('loads a local favicon without external requests', async ({ page, baseURL }) => {
    const external: string[] = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) external.push(request.url()); });
    await page.goto('./');
    const href = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(href).toBeTruthy();
    const faviconURL = new URL(href!, page.url());
    expect(faviconURL.origin).toBe(new URL(baseURL!).origin);
    expect((await page.request.get(faviconURL.toString())).status()).toBe(200);
    expect(external).toEqual([]);
  });
});
