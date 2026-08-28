import { test, expect, type Page } from '@playwright/test';

async function activate(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name }); await button.focus(); await button.press('Enter');
}
async function chooseMissionAndTarget(page: Page, missionName: RegExp, targetName: RegExp | null) {
  await page.getByRole('radio', { name: missionName }).check();
  if (targetName) await page.getByRole('radio', { name: targetName }).last().check();
  await activate(page, '성질 분석실로');
}
async function confirmProperties(page: Page, propertyNames: readonly RegExp[]) {
  for (const name of propertyNames) await page.getByRole('checkbox', { name }).check();
  await activate(page, '공정 설계판으로');
}
async function addAction(page: Page, actionName: string, option: string | null, inputLabel: RegExp | null) {
  await page.getByRole('button', { name: new RegExp(`(?:방법 선택|준비 행동 선택): ${actionName}$`) }).click();
  if (option) await page.getByRole('radio', { name: option, exact: true }).check();
  if (inputLabel) await page.getByRole('radio', { name: inputLabel }).check();
  await page.getByRole('button', { name: /단계에 넣기/ }).click();
}
async function executeAllSteps(page: Page, predictedOutputLabels: readonly RegExp[]) {
  for (const prediction of predictedOutputLabels) {
    await page.getByRole('radio', { name: prediction }).check();
    await activate(page, /단계 가상 실행/);
    await expect(page.getByRole('table', { name: '단계별 물질 토큰 상태' }).last()).toBeVisible();
  }
  await activate(page, /품질 검사로/);
}
async function claimRecovery(page: Page, labels: readonly string[], streamIds: readonly string[]) {
  for (let index = 0; index < labels.length; index += 1) { const select = page.getByLabel(new RegExp(`${labels[index]} 회수 물질함`)); await select.selectOption(streamIds[index]); await expect(select).toHaveValue(streamIds[index]); }
  await activate(page, /공정 설명|수정 공정 보고서|문제 단계 수정/);
}

test.describe('전체 미션 learner flow', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./'); await page.evaluate(() => localStorage.clear()); await page.reload(); });
  for (const mission of [
    { title: /크기 선별선/, target: /고운 모래/, properties: [/알갱이 크기/], actions: [['체로 분리', '중간 간격', null]] as const, predictions: [/통과/] },
    { title: /두 액체 관찰조/, target: /식용유 모형/, properties: [/서로 섞이지 않음과 층/], actions: [['층 기다리기', null, null], ['층 분리', null, /1단계.*층이 생긴 물질함/]] as const, predictions: [/층이 생긴 물질함/, /위층/] },
    { title: /소금 회수선/, target: /소금/, properties: [/물에 녹는 성질/, /거름 행동/, /가상 증발 후 남는 물질/], actions: [['물 넣기', null, null], ['거르기', null, /1단계.*섞인 물질함/], ['가상 증발', null, /2단계.*거른 액체/]] as const, predictions: [/섞인 물질함/, /거른 액체/, /고체 잔류/] },
  ]) {
    test(`${mission.title.source ?? '미션'} 완료 보고서`, async ({ page }) => {
      const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message)); page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      await chooseMissionAndTarget(page, mission.title, mission.target);
      await confirmProperties(page, mission.properties);
      for (const [name, option, input] of mission.actions) await addAction(page, name, option, input);
      await activate(page, '가상 실행 준비');
      await executeAllSteps(page, mission.predictions);
      const claimStream = mission.title.source?.includes('크기') ? 'step-1:pass' : mission.title.source?.includes('액체') ? 'step-2:upper' : 'step-3:solid-residue';
      await claimRecovery(page, [mission.target.source], [claimStream ?? '']);
      await expect(page.getByTestId('mission-complete')).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(`${mission.title.source} 완료 보고서`) })).toBeVisible();
      await expect(page.locator('body')).toContainText(mission.target);
      await expect(page.locator('body')).toContainText(/이용 성질|성질/);
      await expect(page.locator('body')).not.toContainText(/학생 이름|실명|이메일|정밀 측정|실제 순도|실제 수율/);
      const reflection = '다시 쓰고 나누는 생활을 실천하겠습니다.';
      await page.getByLabel(/지속가능한 생활/).fill(reflection);
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mixture-separation-process-lab:v1') ?? '{}').sustainabilityReflection)).toBe(reflection);
      await page.reload();
      await expect(page.getByLabel(/지속가능한 생활/)).toHaveValue(reflection);
      expect(errors).toEqual([]);
    });
  }
});

test('통합 공정은 최초와 수정 공정을 모두 기록한다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await chooseMissionAndTarget(page, /통합 공정/, null);
  await confirmProperties(page, [/알갱이 크기/, /물에 녹는 성질/, /거름 행동/, /가상 증발 후 남는 물질/]);
  await addAction(page, '체로 분리', '넓은 간격', null); await addAction(page, '물 넣기', null, /1단계.*통과/);
  await addAction(page, '거르기', null, /2단계.*섞인 물질함/); await addAction(page, '가상 증발', null, /3단계.*거른 액체/);
  await activate(page, '가상 실행 준비'); await executeAllSteps(page, [/통과/, /섞인 물질함/, /거른 액체/, /고체 잔류/]);
  await claimRecovery(page, ['자갈', '모래', '소금'], ['step-1:retained', 'step-3:filter-residue', 'step-4:solid-residue']);
  await page.getByLabel('공정을 바꾼 이유').fill('알갱이 크기 성질을 다시 살펴 중간 간격으로 바꾸었습니다.');
  await activate(page, '1단계 교체');
  await page.getByRole('button', { name: /방법 선택: 체로 분리/ }).click();
  await page.getByRole('radio', { name: '중간 간격', exact: true }).check();
  await page.getByRole('button', { name: '교체하기' }).click();
  await activate(page, '가상 실행 준비');
  await executeAllSteps(page, [/통과/, /섞인 물질함/, /거른 액체/, /고체 잔류/]);
  await claimRecovery(page, ['자갈', '모래', '소금'], ['step-1:retained', 'step-3:filter-residue', 'step-4:solid-residue']);
  await expect(page.getByTestId('mission-complete')).toBeVisible();
  await expect(page.getByRole('heading', { name: '통합 공정 완료 보고서' })).toBeVisible();
  await expect(page.locator('body')).toContainText(/자갈|모래|소금/);
  await expect(page.locator('body')).toContainText(/알갱이 크기|물에 녹는 성질/);
  await expect(page.locator('body')).not.toContainText(/학생 이름|실명|이메일|정밀 측정|실제 순도|실제 수율/);
  await expect(page.getByText('최초 공정')).toBeVisible(); await expect(page.getByText('수정 공정')).toBeVisible();
  await expect(page.getByText(/알갱이 크기 성질을 다시 살펴/)).toBeVisible();
  const finalReflection = '분리한 재료를 다시 쓰는 지속가능한 생활을 실천하겠습니다.';
  await page.getByLabel(/지속가능한 생활/).fill(finalReflection);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mixture-separation-process-lab:v1') ?? '{}').sustainabilityReflection)).toBe(finalReflection);
  await page.reload();
  await expect(page.getByLabel(/지속가능한 생활/)).toHaveValue(finalReflection);
  expect(errors).toEqual([]);
});

export { chooseMissionAndTarget, confirmProperties, addAction, executeAllSteps, claimRecovery };
