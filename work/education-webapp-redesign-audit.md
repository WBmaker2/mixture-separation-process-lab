# Education Web App Redesign Audit

> 대상: 혼합물 분리 공정 설계소
> 초기 감사일: 2026-08-29
> 모드: 초기 기준선 기록
> 검토 범위: 코드·콘텐츠·화면 위계·키보드/모바일·안전·개인정보·정적 자산

## Evidence and boundary

- 프레임워크: Vite + React + TypeScript. `src/main.tsx`가 `App`과 다섯 개 스타일 파일을 진입합니다.
- 학습 상태·시뮬레이션·판정은 `src/state/**`, `src/simulation/**`, `src/domain/**`에 있고, 이번 리디자인에서 변경하지 않습니다.
- 기존 저장소 문서 `AGENTS.md`, `EDUCATION_DESIGN.md`, `design-system/MASTER.md`는 존재하지 않았습니다. 리디자인 기준은 별도 `design-system/MASTER.md`에 기록합니다.
- 기존 미커밋 경로는 `.superpowers/sdd/2026-08-28-mixture-separation-process-lab-improvement-plan/task-1-report.md`, `.gstack/`, `.playwright-mcp/`, `output/`이며 감사·구현 범위에서 제외했습니다.
- 로컬 Vite 서버 `http://127.0.0.1:5175/`에서 캡처한 기준 화면:
  - 데스크톱: `/private/tmp/mixture-redesign-audit-desktop.png`
  - 모바일: `/private/tmp/mixture-redesign-audit-mobile.png`
- 실제 브라우저 DOM 기준선(2026-08-29): 1440px와 375px 모두 `scrollWidth`가 viewport와 같고, 초기 화면의 `data-attention="true"`는 0개(미션을 고르기 전), `aria-live="polite"`는 0개(실행 화면 진입 전), 안전 안내는 1개입니다.
- `PRODUCT.md`는 기존 계획의 확인된 사용자·목적·플랫폼·안전 제약만 옮겨 2026-08-30에 추가했으며, 새로운 시각 방향이나 사실을 발명하지 않았습니다.
- 첫 화면에는 제목·단계 nav·미션 선택·안전 안내·업데이트 내역 버튼이 보입니다. 미션을 선택한 뒤에만 주요 CTA가 나타나는 현재 동작은 유지해야 합니다.

## Findings

### P1 — 첫 행동의 위계가 약함

- **근거:** `src/components/AppShell.tsx`의 7단계가 한 줄 flex-wrap 텍스트로 표시되고, 초기 화면에는 미션을 선택하기 전 CTA가 없습니다. 데스크톱에서는 단계 목록이 두 줄로 흐르고 모바일에서는 7개 항목이 길게 세로로 쌓입니다.
- **학습 영향:** 초등 학습자가 지금 어디에 있고 다음에 무엇을 눌러야 하는지 제목만으로 판단해야 합니다. 현재 단계·완료·잠금 상태가 구조적으로 분리되지 않습니다.
- **수정:** `LearningProgress` 정적 목록과 현재 단계의 `nextAction` 요약을 셸에 추가하고, 화면마다 `StageHeader`로 “지금 할 일”을 한 문장으로 표시합니다. 잠금 단계는 조작 가능한 링크로 만들지 않습니다.
- **합격:** 셸 테스트에서 7개 단계, 현재 단계 `aria-current="step"`, 완료/잠금 상태 문구가 확인되고, 375px에서 progress가 가로 overflow를 만들지 않습니다.

### P1 — 초기 안내와 안전 안내가 중복됨

- **근거:** `src/features/intake/IntakeScreen.tsx`의 hero에 가상 실험·토큰·실제 결과 문장이 세 줄로 있고, 바로 아래 `SafetyNotice`가 같은 경계를 다섯 줄로 다시 표시합니다.
- **학습 영향:** 미션을 고르기 전에 읽어야 할 핵심 질문과 행동이 안전 문구에 묻힙니다. 안전을 줄이는 것이 아니라 위치와 중복을 정리해야 합니다.
- **수정:** hero는 학습 질문과 다음 행동만 남기고, `SafetyNotice` 한 블록에서 측정 경계·실제 결과 변동·교사 지도·모델 한계·화면 재료 경계를 유지합니다. 실행 화면과 보고서에는 설계 문서가 요구한 한계 문장을 계속 표시합니다.
- **합격:** intake의 `measurementBoundary`, `variationBoundary`, `modelLimit`가 hero와 notice에 중복 렌더링되지 않고, 안전 문장 자체는 한 번 이상 보입니다.

### P1 — 학습 카드와 보조 조작의 시각적 구분이 약함

- **근거:** `src/styles/components.css`에서 `.primary-action`, `.action-card button`, 슬롯 버튼, 보고서 버튼이 비슷한 파란 pill 규칙을 공유합니다. 행동 카드 안에 적용 조건·출력·잔류·모델 한계·안전이 모두 같은 밀도로 배치됩니다.
- **학습 영향:** 방법 선택과 공정 진행을 같은 우선순위로 오해할 수 있고, 모바일에서 카드가 길어져 다음 단계 버튼을 찾기 어렵습니다.
- **수정:** `PrimaryAction`은 다음 단계 CTA에만 사용하고, 행동 카드에는 `방법`/`준비` 배지·짧은 성질 근거·출력 요약·세부 설명 순서를 적용합니다. 공정 슬롯 보조 버튼은 중립 테두리 버튼으로 구분합니다.
- **합격:** 각 화면의 주요 CTA만 `data-attention="true"`이고, 행동 카드의 kind 배지와 보조 조작의 비펄스 스타일이 DOM/CSS에서 확인됩니다.

### P1 — 375px에서 긴 공정·보고서의 시선 이동 부담

- **근거:** 현재 CSS는 overflow를 막지만 공정 설계판·시뮬레이션·보고서가 한 화면에 긴 카드와 표를 연속 배치합니다. `ProcessBoardScreen`은 행동 카드 → 설정 → 슬롯 → 미리보기 → 오류 → CTA 순으로 읽어야 합니다.
- **학습 영향:** 화면이 정상적으로 스크롤되어도 단계별 “지금 할 일”과 완료 조건을 잃기 쉽습니다.
- **수정:** 화면 상단 학습 힌트, 현재 단계 카드, 결과·다음 행동 영역을 각각 표면으로 분리하고 설정 선택 때의 포커스·스크롤을 유지합니다. 표는 현재 `data-label` 모바일 행 구조를 보존합니다.
- **합격:** 375px에서 `document.documentElement.scrollWidth <= 375`, 주요 CTA가 현재 카드 뒤에 바로 오며, 키보드 E2E가 드래그 없이 네 미션을 완료합니다.

### P2 — 문구의 내부 용어 노출 위험

- **근거:** 대부분의 화면은 한국어 라벨을 사용하지만 `ProcessBoardScreen`의 오류·입력 복구, `ProcessComparison`의 일부 포트 표현, 상태 판정 경로가 내부 단계 ID에 의존합니다. 현재 일부 표현은 “출력 스트림”처럼 교사·개발자에게 익숙한 말입니다.
- **학습 영향:** 아이가 물질함의 의미보다 시스템 구조를 먼저 해석하게 됩니다.
- **수정:** `learningCopy.ts`와 기존 display label 함수를 사용해 “앞 단계에서 나온 물질함”, “통과/잔류”처럼 바꾸고 내부 ID는 화면에 렌더링하지 않습니다. 판정·저장 데이터는 그대로 둡니다.
- **합격:** learner-flow와 report 테스트에서 `step-1`, `unchanged`, `stream` 같은 내부 용어가 학생-facing 텍스트로 나오지 않습니다.

### P2 — 스타일 토큰 중복과 유지보수 위험

- **근거:** `src/styles/tokens.css`와 `src/styles/global.css`에 `--surface`, `--accent`, `--focus`, `--ink-soft`가 중복 선언되고, `components.css`에 색상·간격·반경이 직접 반복됩니다.
- **영향:** 화면별 색상·포커스가 달라질 때 한 곳을 놓치기 쉽고, 향후 학습 카드 개선의 회귀 위험이 커집니다.
- **수정:** `design-system/MASTER.md`와 `tokens.css`의 단일 토큰 집합을 기준으로 공통·기능별 CSS를 나눕니다. `components.css`의 동일 selector 중복을 제거하고 각 CSS 파일을 500줄 미만으로 유지합니다.
- **합격:** `rg "--(surface|accent|focus|ink-soft)" src/styles` 결과가 tokens.css의 정의와 참조로 일관되고, `wc -l`로 모든 스타일 파일이 500줄 미만입니다.

### P2 — 접근성 상태 전달은 양호하나 공통화 여지

- **근거:** `AppShell`은 단계 전환 시 main에 포커스를 이동하고, `SimulationScreen`은 `LiveRegion` 하나와 전후 장면·상태표를 제공합니다. `PrimaryAction`, skip link, 44px 입력 규칙도 이미 존재합니다.
- **유지:** 이 동작을 리디자인에서 회귀시키지 않고 `LearningProgress`, `StageHeader`, `LearningCallout`에 semantics를 재사용합니다.
- **합격:** axe 테스트, Tab/Enter/Space, reduced motion, 한 개의 `aria-live="polite"` 검사가 모두 통과합니다. VoiceOver는 이 작업의 검증 범위에 포함하지 않습니다.

### P2 — 이미지·외부 자산 위험 없음

- **근거:** `public/favicon.svg` 외에 `public`, `src/assets`, JSX `src`, CSS `url()`, `srcset`에서 학습용 이미지 참조를 찾지 못했습니다. 물질은 CSS 패턴·모양·이름·수량으로 표현됩니다.
- **판정:** 현재 이미지 추가는 학습 목표보다 장식을 늘릴 가능성이 있어 생성하지 않습니다. favicon은 브랜드/정체성 자산이므로 자동 교체하지 않습니다.
- **합격:** `work/education-webapp-redesign-assets.md`에 유지·무생성 판정을 기록하고 외부 URL·폰트가 없습니다.

## Initial priority and implementation order

1. 진행 표시·다음 행동 위계와 안전 문장 중복(P1)
2. 행동 카드·공정 슬롯·주요 CTA 구분(P1)
3. 375px 세로 계층·키보드 포커스 회귀(P1)
4. 내부 용어 정리·토큰 단일화(P2)
5. 자산·개인정보·안전 최종 대조(P2)

최종 감사에서는 각 항목에 실제 변경 경로와 자동·브라우저 증거를 덧붙이고, 확인하지 못한 인간 검토는 `pending`으로 분리합니다.

## Final implementation observation — 2026-08-29

- `LearningProgress`, `StageHeader`, `LearningCallout`과 중앙 `STAGE_COPY`를 추가해 현재 단계·완료 단계·잠긴 단계와 다음 행동을 공통 구조로 제공했습니다. `src/domain/**`, `src/simulation/**`, `src/state/**`는 변경하지 않았습니다.
- 미션·성질·공정·실행·결과·기록 화면은 공통 헤더와 학습 콜아웃을 사용하며, 행동 카드는 `분리 방법` 또는 `준비 행동` 배지를 표시합니다. 주요 CTA는 `PrimaryAction`/`gi-pulse` 계약을 유지하고 보조 버튼과 구분했습니다.
- 중앙 토큰과 기능별 CSS 파일을 추가했으며 모든 CSS/TSX 파일은 500줄 미만입니다. 라이트 모드와 reduced-motion 대체 스타일을 유지했습니다.
- 자동 증거: 후속 수정까지 반영한 `npm run test -- --run` 22개 파일/103개 테스트 통과, `npm run test:a11y` 3개 통과, `npm run build` 성공, `git diff --check` 공백 오류 없음.
- 브라우저 증거: 이전 4173 포트 진단은 최종 증거에서 제외하고, 전용 4180 포트의 새 Vite 서버에서 승인된 Chromium으로 전체 미션·375px 키보드·개인정보·안전·리디자인 회귀·reduced-motion E2E 18개가 모두 통과했습니다.
- VoiceOver·음성 기능은 구현하거나 검증하지 않았습니다. 이미지 자산은 추가하지 않았고 `public/favicon.svg`를 보존했습니다.

## Follow-up review fixes — 2026-08-29

- `src/features/properties/PropertyLabScreen.tsx`의 성질 체크 라벨을 입력·텍스트 묶음으로 나누고 `src/styles/learning.css`에서 checkbox를 왼쪽에 고정했습니다. 1280px에서 체크박스와 설명이 같은 읽기 시작점에 놓입니다.
- `src/features/process-board/ProcessBoardScreen.tsx`는 전역 객체 순서가 아니라 각 미션의 `allowedActionIds` 순서를 렌더링합니다. 통합 공정은 `체로 분리 → 물 넣기 → 거르기 → 가상 증발`으로 표시됩니다.
- `components.css`의 기존 공통 규칙은 보존하되 새 기능 CSS의 충돌 selector를 화면 범위 selector로 구체화하고, global의 중복 `:root` 토큰 선언을 제거했습니다.
- `playwright.config.ts`를 `reuseExistingServer: false`로 설정하고 기존 4180 포트 프로세스(PID 24210)를 종료한 뒤 새 Vite 서버를 띄웠습니다. 새 전용 `http://127.0.0.1:4180`에서 승인된 Chromium 실행으로 18개 E2E가 27.0초에 모두 통과했습니다. 이전 4173 포트의 다른 앱 및 비승인 Chromium 실패 기록은 환경 진단이며, 최종 전용 포트 증거는 새 서버의 이 18개 통과 결과입니다.
- 캡처한 학습자 화면은 `/private/tmp/mixture-redesign-final-desktop.png`, `/private/tmp/mixture-redesign-final-mobile.png`, `/private/tmp/mixture-redesign-properties.png`, `/private/tmp/mixture-redesign-process.png`, `/private/tmp/mixture-redesign-quality.png`, `/private/tmp/mixture-redesign-report.png`입니다. 소금 회수선의 시작부터 완료 보고서까지 1280px 흐름에서 `scrollWidth`가 viewport와 같고, 마지막 화면에 주요 CTA 1개·라이브 영역 0개(완료 상태)로 확인했습니다.
- `--muted`를 `#5a6f7f`로 조정하고 `design-system/MASTER.md`에 밝은 페이지 배경 대비 4.5:1 기준을 기록했습니다. 단위·axe·빌드·diff 검증을 다시 통과했습니다.
- 수동 캡처는 1440px·375px 초기 화면과 1280px 전체 학습 흐름까지 수행했습니다. 320px·768px의 별도 수동 캡처는 실행하지 않았으며, 375px 자동 키보드·overflow E2E가 해당 좁은 화면 계약을 검증합니다.

## Mechanical design pass — 2026-08-30

- `impeccable` detector의 1회 검사에서 기존·신규 콜아웃의 `border-left: 5px` side-tab 경고 4건을 확인했습니다.
- `src/styles/components.css`, `src/styles/learning.css`, `src/styles/report.css`의 안내·안전 표면을 1px 외곽선과 상단 inset 강조로 바꿔 색상·역할 구분은 유지하면서 두꺼운 측면 탭 패턴을 제거했습니다.
- detector는 스킬 규칙에 따라 재실행하지 않고, 변경 후 단위·axe·빌드·전용 브라우저 회귀 검증으로 동작을 확인합니다.
