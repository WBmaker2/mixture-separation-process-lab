import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });
interface KeyboardMissionCase { missionName: RegExp; targetName: RegExp | null; propertyNames: readonly RegExp[]; actionNames: readonly string[]; inputPortValues: readonly string[]; sieveGap: '넓은 간격' | '중간 간격' | null; revisionSieveGap?: '넓은 간격' | '중간 간격'; predictedOutputNames: readonly RegExp[]; claimStreamIds: readonly string[]; requiresRevision: boolean; completionName: RegExp; }
const cases: readonly KeyboardMissionCase[] = [
  { missionName: /크기 선별선/, targetName: /고운 모래/, propertyNames: [/알갱이 크기/], actionNames: ['방법 선택: 체로 분리'], inputPortValues: ['initial'], sieveGap: '중간 간격', predictedOutputNames: [/통과/], claimStreamIds: ['step-1:pass'], requiresRevision: false, completionName: /크기 선별선/ },
  { missionName: /두 액체 관찰조/, targetName: /식용유 모형/, propertyNames: [/서로 섞이지 않음과 층/], actionNames: ['준비 행동 선택: 층 기다리기', '방법 선택: 층 분리'], inputPortValues: ['initial', 'step-1|layered-mixture'], sieveGap: null, predictedOutputNames: [/층이 생긴 물질함/, /위층/], claimStreamIds: ['step-2:upper'], requiresRevision: false, completionName: /두 액체 관찰조/ },
  { missionName: /소금 회수선/, targetName: /소금/, propertyNames: [/물에 녹는 성질/, /거름 행동/, /가상 증발 후 남는 물질/], actionNames: ['준비 행동 선택: 물 넣기', '방법 선택: 거르기', '방법 선택: 가상 증발'], inputPortValues: ['initial', 'step-1|mixture', 'step-2|filtrate'], sieveGap: null, predictedOutputNames: [/섞인 물질함/, /거름 찌꺼기/, /고체 잔류/], claimStreamIds: ['step-3:solid-residue'], requiresRevision: false, completionName: /소금 회수선/ },
  { missionName: /통합 공정/, targetName: null, propertyNames: [/알갱이 크기/, /물에 녹는 성질/, /거름 행동/, /가상 증발 후 남는 물질/], actionNames: ['방법 선택: 체로 분리', '준비 행동 선택: 물 넣기', '방법 선택: 거르기', '방법 선택: 가상 증발'], inputPortValues: ['initial', 'step-1|pass', 'step-2|mixture', 'step-3|filtrate'], sieveGap: '넓은 간격', revisionSieveGap: '중간 간격', predictedOutputNames: [/잔류/, /섞인 물질함/, /거름 찌꺼기/, /고체 잔류/], claimStreamIds: ['step-1:retained', 'step-3:filter-residue', 'step-4:solid-residue'], requiresRevision: true, completionName: /통합 공정/ },
];
async function keyPress(locator: ReturnType<Page['getByRole']>, key: 'Space' | 'Enter' | 'ArrowDown') { await locator.focus(); await locator.press(key); }
async function assertMobile(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375); await expect(page.locator('[draggable="true"]')).toHaveCount(0); await expect(page.locator('[data-attention="true"]')).toHaveCount(1); }
async function chooseSelect(page: Page, select: ReturnType<Page['locator']>, value: string) { const index = await select.locator('option').evaluateAll((options, wanted) => options.findIndex((option) => option.getAttribute('value') === wanted), value); expect(index).toBeGreaterThan(0); await select.focus(); await page.keyboard.press('Space'); for (let i = 0; i < index; i += 1) await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await expect(select).toHaveValue(value); }

async function completeMissionWithKeyboard(page: Page, mission: KeyboardMissionCase): Promise<void> {
  const missionValue = mission.missionName.source.includes('크기') ? 'size-sort' : mission.missionName.source.includes('액체') ? 'liquid-layers' : mission.missionName.source.includes('소금') ? 'salt-recovery' : 'integrated-process';
  await keyPress(page.locator(`input[name="mission"][value="${missionValue}"]`), 'Space');
  if (mission.targetName) await keyPress(page.getByRole('radio', { name: mission.targetName }).last(), 'Space');
  await assertMobile(page); await keyPress(page.getByRole('button', { name: '성질 분석실로' }), 'Enter');
  for (const propertyName of mission.propertyNames) await keyPress(page.getByRole('checkbox', { name: propertyName }).first(), 'Space');
  await assertMobile(page); await keyPress(page.getByRole('button', { name: '공정 설계판으로' }), 'Enter');
  for (let index = 0; index < mission.actionNames.length; index += 1) {
    await keyPress(page.getByRole('button', { name: mission.actionNames[index] }), 'Enter');
    if (mission.actionNames[index].includes('체로')) await keyPress(page.getByRole('radio', { name: mission.sieveGap ?? '넓은 간격' }), 'Space');
    if (index > 0) await keyPress(page.locator(`input[name="input-port"][value="${mission.inputPortValues[index]}"]`), 'Space');
    await keyPress(page.getByRole('button', { name: `${index + 1}단계에 넣기` }), 'Enter');
  }
  await assertMobile(page); await keyPress(page.getByRole('button', { name: '가상 실행 준비' }), 'Enter');
  for (let index = 0; index < mission.actionNames.length; index += 1) {
    await keyPress(page.getByRole('radio', { name: mission.predictedOutputNames[Math.min(index, mission.predictedOutputNames.length - 1)] }).first(), 'Space');
    await keyPress(page.getByRole('button', { name: `${index + 1}단계 가상 실행` }), 'Enter'); await assertMobile(page);
  }
  await keyPress(page.getByRole('button', { name: '품질 검사로' }), 'Enter');
  for (let index = 0; index < mission.claimStreamIds.length; index += 1) await chooseSelect(page, page.locator('select').nth(index), mission.claimStreamIds[index]);
  await assertMobile(page); await keyPress(page.getByRole('button', { name: mission.requiresRevision ? '문제 단계 수정하기' : '결과를 바탕으로 공정 설명하기' }), 'Enter');
  if (mission.requiresRevision) {
    const reason = page.getByLabel('공정을 바꾼 이유'); await reason.focus(); await page.keyboard.type('체 간격을 바꾸어 남은 물질의 위치를 다시 확인했습니다.');
    await keyPress(page.getByRole('button', { name: /1단계 교체/ }), 'Enter'); await keyPress(page.getByRole('button', { name: '방법 선택: 체로 분리' }), 'Enter'); await keyPress(page.getByRole('radio', { name: mission.revisionSieveGap ?? '중간 간격' }), 'Space'); await keyPress(page.getByRole('button', { name: '교체하기' }), 'Enter');
    await keyPress(page.getByRole('button', { name: '가상 실행 준비' }), 'Enter');
    for (let index = 0; index < mission.actionNames.length; index += 1) { await keyPress(page.getByRole('radio', { name: mission.predictedOutputNames[Math.min(index, mission.predictedOutputNames.length - 1)] }).first(), 'Space'); await keyPress(page.getByRole('button', { name: `${index + 1}단계 가상 실행` }), 'Enter'); }
    await keyPress(page.getByRole('button', { name: '품질 검사로' }), 'Enter');
    for (let index = 0; index < mission.claimStreamIds.length; index += 1) await chooseSelect(page, page.locator('select').nth(index), mission.claimStreamIds[index]);
    await keyPress(page.getByRole('button', { name: '수정 공정 보고서 만들기' }), 'Enter');
  }
  const reflection = page.getByLabel('생활 속 분리 기술과 지속가능한 생활에 이 공정이 어떻게 이어질까요?'); await reflection.focus(); await page.keyboard.type('분리한 물질을 다시 쓰면 버리는 자원을 줄일 수 있습니다.'); await assertMobile(page); await expect(page.getByRole('heading', { name: mission.completionName })).toBeVisible();
}
for (const mission of cases) test(`completes ${mission.completionName.source} with keyboard at 375px`, async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); await completeMissionWithKeyboard(page, mission); });
