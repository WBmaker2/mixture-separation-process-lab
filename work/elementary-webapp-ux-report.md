# Elementary Web App UX Improvement Report

- Date: 2026-08-31
- Mode: `full`
- Target: `/Volumes/ External Drive 256G/Dev2/codex/mixture-separation-process-lab`
- Stage 0: `ready` — `work/elementary-webapp-ux-bootstrap.md`
- Primary learner panel: 서윤, 초등 5–6학년; 준호, 초3–4는 용어 guardrail
- Existing redesign contract: `work/education-webapp-redesign-plan.md`
- Gate result: **앱 기능 수용 PASS (96/100)**. The repository's default Playwright launcher is **environment-blocked** because the bundled headless shell is absent; the equivalent system-Chrome run passed all 19 tests.

## What changed

| File | Change |
| --- | --- |
| `src/features/quality/QualityScreen.tsx` | Replaced the abstract quality heading, added valid-claim readiness calculation, added a concrete missing-claim hint, and disabled the existing primary action until every displayed target has a valid active stream. |
| `src/features/quality/RecoveryClaimPanel.tsx` | Shortened stream options to step/output names, kept IDs only as control values, and added an `aria-describedby` token-content helper for each select. |
| `src/features/quality/QualityLedger.tsx` | Added mobile cell labels so the semantic quality table becomes a readable stacked card at narrow widths. |
| `src/features/simulation/SimulationScreen.tsx` | Scoped completion copy to “현재 공정의 단계를 모두 실행했어요” and directed the learner to the drafted process's token boxes. |
| `src/styles/simulation.css` | Added helper styling and narrow-screen quality table/card rules while retaining 44px controls and reduced-motion behavior. |
| `src/content/learningCopy.ts` | Centralized the concrete quality-stage title. |
| `src/content/updateHistory.ts` | Added the dated 2026-08-31 improvement entry. |
| `src/features/quality/QualityScreen.test.tsx` | Added readiness, heading, and mobile-label assertions. |
| `src/features/quality/RecoveryClaimPanel.test.tsx` | Added short-option, no-ID, helper, and `aria-describedby` assertions. |
| `src/features/simulation/SimulationScreen.test.tsx` | Added scoped completion-copy assertion. |
| `src/components/UpdateHistoryDialog.test.tsx` | Asserted the 2026-08-31 entry is visible. |
| `e2e/improvement-regressions.spec.ts` | Added a 375px quality readiness/option-label regression. |

No file under `src/domain/**`, `src/simulation/**` (rule/model files), or `src/state/**` was changed. No package, image, font, network, login, identifier, or voice feature was added.

## TDD and automated verification

1. The new focused tests were run before implementation and failed in five assertions: enabled empty-claim CTA, old heading, long stream labels, and old completion phrase.
2. After minimal implementation, focused tests passed: **3 files / 20 tests**.
3. Full Vitest suite passed: **23 files / 109 tests**.
4. Accessibility suite passed: **1 file / 3 axe tests**.
5. Production build passed: `tsc -b` and Vite generated `dist/` successfully.
6. `git diff --check` passed with no whitespace errors.
7. The standard `npm run test:e2e -- --workers=1` could not launch because `/Users/kimhongnyeon/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell` is not installed. This is a local runner prerequisite failure before test execution, not an application assertion failure.
8. Equivalent system-Chrome run passed **19/19** using `/private/tmp/mixture-playwright.chrome.config.mjs` with one worker, covering learner flow, mobile keyboard, privacy/safety, visual contracts, reduced motion, and the new regression.

## Browser evidence

| Scenario | Evidence |
| --- | --- |
| Quality, selected claim, 375×812 | `output/playwright/elementary-quality-final-375.png`; `scrollWidth=360`, `bodyHeight=1496`, CTA top `758.8`, enabled after selecting `step-1:pass`. |
| Quality, selected claim, 320×800 | `output/playwright/elementary-quality-final-320.png`; `scrollWidth=320`, `bodyHeight=1518`, CTA fully visible in the full-page capture; options contain no `step-*` text. |
| Quality, selected claim, 1280×900 | `output/playwright/elementary-quality-final-1280.png`; `scrollWidth=1265`, CTA top `638.3`, enabled. |
| Empty claim state | Snapshot `page-2026-08-30T23-27-08-002Z.yml`; hint and disabled `문제 단계 수정하기` are visible. |
| Simulation completion | Snapshot `page-2026-08-30T23-26-43-288Z.yml`; scoped completion title and token-box next action are visible. |
| Runtime/network | Custom system-Chrome learner script reported `errors=[]` and `external=[]`. |
| Keyboard and reduced motion | Full 19-test system-Chrome run passed the four 375px keyboard missions and the reduced-motion static-scene test. VoiceOver was not run. |

## Finding status

- `EDU-UX-001`, `EDU-LANG-001`, `EDU-LANG-002`, `EDU-UX-002`, and `EDU-UX-003`: **fixed** and confirmed in the language/audit ledgers.
- `EDU-UX-004`: **open P3 follow-up**. The entry screen still uses a tall seven-step orientation and safety block; it is readable and safe, but the complete first action may require scrolling on a 375px phone. The cycle did not move safety content or remove orientation because that would change a stable learning/safety contract.

## Simulation decision

`work/elementary-webapp-ux-simulation-decision.md` records `not-needed` for a new Canvas/WebGL/game/data-visualization implementation. The existing deterministic DOM token simulation remains intact and passed prediction → action → observation → explanation → revision/report checks. `pause` and a new temporal `step` control are N/A because the learner already runs one authored process step at a time.

## Learner comprehension outcome

- Before claims: the learner can say “목표 물질마다 물질함을 고른다” because the hint names that action and the next button is disabled.
- After a claim: the learner sees a short option such as `1단계 · 통과 물질함` and the exact token summary below it.
- After execution: the learner sees before/after scenes, the token table, prediction comparison, and a completion sentence scoped to the drafted process.
- Final takeaway remains the report's separation explanation and sustainability reflection; the next action remains the existing report/revision flow.

## Remaining checks

- No actual child or teacher research was performed; the panel is an observable comprehension simulation.
- VoiceOver, TTS, narration, recording, and other voice features were not implemented or tested.
- The default Playwright browser cache needs to be restored before the unmodified `npm run test:e2e` command can run locally; system-Chrome evidence is green.

## Release evidence

- PR [#1](https://github.com/WBmaker2/mixture-separation-process-lab/pull/1) was merged into `main` on 2026-08-31.
- Merge commit: `a5a9387c4dcefe00089e51db699d07f11fda51a0`.
- GitHub Pages workflow [33344930656](https://github.com/WBmaker2/mixture-separation-process-lab/actions/runs/33344930656) completed successfully (build and deploy jobs).
- Public learner URL: `https://wbmaker2.github.io/mixture-separation-process-lab/`.
- Public verification returned HTTP 200, title `혼합물 분리 공정 설계소`, relative JS/CSS/favicon assets, no console errors, no external requests, and a working 375px mission-selection path.
- HVC registration was not changed in this release.
