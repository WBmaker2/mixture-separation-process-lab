# Elementary Web App UX Improvement Plan

- Date: 2026-08-31
- Mode: `full`
- Target: `/Volumes/ External Drive 256G/Dev2/codex/mixture-separation-process-lab`
- Pre-existing plan: `work/education-webapp-redesign-plan.md` remains the broad redesign contract. This document is the student-panel follow-up plan and does not duplicate or replace it.
- Approval boundary: implement the scoped learner-facing changes below; do not change domain rules, simulation math, persistence schema, privacy/safety boundaries, or external release state.

## Goal

Make the result-checking stage tell a grade 5–6 learner one concrete action at a time: read the movement, choose the material box for every target, then continue. Shorten stream choices without hiding token evidence, and scope simulation completion language to the drafted process. Preserve the 7-stage learning journey, prediction loop, quality categories, revision flow, reduced-motion fallback, update-history control, and accessible DOM.

## Architecture

1. `src/domain/**`, `src/simulation/**`, and `src/state/**` remain the source of truth for mission contracts, token movement, quality evaluation, and local persistence.
2. `QualityScreen` owns stage-level readiness presentation. It computes whether every displayed target has a valid active stream claim, disables its existing `PrimaryAction` until ready, and shows a `LearningCallout` hint without dispatching a new action type.
3. `RecoveryClaimPanel` keeps the existing `RecoveryClaim` and `LabAction` interfaces. It separates a short learner-facing stream label from a linked token-content helper; internal IDs remain only in `value` attributes used by the reducer/tests.
4. `SimulationScreen` changes only the completion callout wording; it does not alter run state or token movement.
5. Existing semantic table markup and CSS remain in place. The quality ledger receives narrow-screen spacing/line-length refinements only; no duplicate hidden table or new rendering engine is introduced.
6. `UPDATE_HISTORY` records the 2026-08-31 improvement entry. No network, analytics, image, font, voice, or identifier feature is added.

## Tech stack

- Existing Vite 8 + React 19 + TypeScript strict mode.
- Existing Vitest, React Testing Library, user-event, jest-axe, and Playwright Chromium.
- Existing CSS files and npm lockfile; no package installation.

## Spec and student-panel traceability

| Requirement | Implementation link | Acceptance evidence |
| --- | --- | --- |
| Learning objective: use observable properties to separate mixtures | Quality heading names choosing a box; guiding question and token table remain unchanged. | Quality unit test and same-state probe show target-to-box action. |
| Existing app distinction: reason from properties and token streams | Short labels preserve step and output names; selected token counts remain visible. | `RecoveryClaimPanel` test contains no learner-facing IDs and exact token counts remain. |
| Core flow: predict → observe → explain → revise/report | Simulation callout wording is scoped; quality cannot skip claims. | `e2e/learner-flow.spec.ts`, `e2e/mobile-keyboard.spec.ts`, and simulation ledger. |
| Content and judgment model | `computeQuality`/`evaluateRun` and reducer are untouched. | Existing simulation/quality tests pass unchanged. |
| Accessibility | Native selects, labels, helper descriptions, focus-visible styles, one primary CTA, reduced-motion CSS remain. | axe, keyboard, 320/375 overflow/CTA checks, reduced-motion test. VoiceOver excluded. |
| Privacy and safety | Only copy and presentation change; `SafetyNotice`, localStorage key, no external requests, and no dangerous procedure remain. | `privacy-safety` E2E and static request capture. |
| MVP and completion criteria | Four missions, reports, quality categories, and sustainability reflection remain. | Full learner-flow suite and report assertions pass. |

## Global constraints

- Use Korean learner copy that is concrete and short, while preserving science terms and facts.
- Keep every source file under 500 lines; split helpers rather than growing a large component.
- Keep `gi-pulse` on the existing primary action contract. A disabled quality action may retain the single attention marker as a readiness cue, but it must also expose the missing-action hint and `disabled` state.
- `prefers-reduced-motion: reduce` must retain a static focus/outline treatment and no animation.
- Keep the update-history button and add a dated 2026-08-31 entry.
- Do not add VoiceOver/TTS/narration/recording, network calls, login, names/emails, remote images/fonts, Canvas/WebGL, or packages.
- Do not stage or delete existing unrelated paths: `.superpowers/sdd/2026-08-28-mixture-separation-process-lab-improvement-plan/task-1-report.md`, `.gstack/`, `.playwright-mcp/`, and `output/`.
- Do not run GitHub, HVC, commit, push, deploy, or release commands in this cycle.

## Expected files and responsibilities

```text
work/elementary-webapp-ux-audit.md               # baseline evidence, personas, findings, score
work/elementary-webapp-ux-language-audit.md      # before/after language ledger and probes
work/elementary-webapp-ux-simulation-decision.md # existing simulation decision and boundaries
work/elementary-webapp-ux-simulation-test.md     # simulation revalidation ledger
work/elementary-webapp-ux-plan.md                # this scoped implementation plan
work/elementary-webapp-ux-report.md              # final evidence and acceptance gate
src/features/quality/QualityScreen.tsx           # claim readiness, heading, hint, disabled CTA
src/features/quality/RecoveryClaimPanel.tsx     # concise stream options and token helper
src/features/quality/QualityScreen.test.tsx      # failing-first readiness/copy tests
src/features/quality/RecoveryClaimPanel.test.tsx # option/helper semantics tests
src/features/simulation/SimulationScreen.tsx     # scoped completion wording
src/features/simulation/SimulationScreen.test.tsx# completion wording regression
src/styles/simulation.css                         # quality helper and narrow-screen readability
src/content/updateHistory.ts                      # dated improvement entry
e2e/improvement-regressions.spec.ts               # browser regression for quality readiness and labels
e2e/mobile-keyboard.spec.ts                       # same keyboard flow with disabled-to-enabled quality CTA
```

## Interfaces

- `QualityScreenProps` remains unchanged.
- `RecoveryClaimPanelProps` remains unchanged.
- `PrimaryActionProps` remains unchanged; use its existing `disabled` and `attention` props.
- Add private pure helper `hasCompleteClaims(run: SimulationRun, targetIds: readonly MaterialId[], claims: readonly RecoveryClaim[]): boolean` in `QualityScreen.tsx`. A claim is valid only when its target is displayed, its stream is in `run.activeLeafStreamIds`, and `Object.prototype.hasOwnProperty.call(run.streams, streamId)` is true.
- Add private `streamOptionLabel(id: string): string` and `streamContents(id: string, run: SimulationRun): string` in `RecoveryClaimPanel.tsx`. `streamOptionLabel` maps known ports to Korean names and never returns raw IDs; `streamContents` preserves exact material names/counts.
- Add `aria-describedby` from each select to its helper paragraph. The helper reports `아직 물질함을 고르지 않았어요.` when empty and `선택한 물질함의 토큰: ...` when selected.

## TDD work sequence

### 1. Write failing tests (no source implementation yet)

- [x] In `src/features/quality/QualityScreen.test.tsx`, add a test that renders `claims=[]`, expects the primary button to be disabled, expects the hint to name each missing target action, and confirms `dispatch` is not called by a direct click attempt.
- [x] Add a test that renders one valid claim and one missing claim for the integrated mission; expect disabled until the second select receives a valid claim.
- [x] In new `src/features/quality/RecoveryClaimPanel.test.tsx`, render a deterministic run and assert options show `1단계 · ... 물질함`, no option text contains `step-`, and the selected-token helper reports exact counts after `selectOptions`.
- [x] In `src/features/simulation/SimulationScreen.test.tsx`, assert the completed-state callout says `현재 공정의 단계를 모두 실행했어요` and does not use the unscoped `모든 단계를 실행했어요` phrase.
- [x] Add an E2E regression in `e2e/improvement-regressions.spec.ts` that reaches quality with no claims, verifies the disabled CTA/hint, then chooses all required streams and verifies the CTA becomes enabled.

Expected first command and result:

```text
npm run test -- --run src/features/quality/QualityScreen.test.tsx src/features/quality/RecoveryClaimPanel.test.tsx src/features/simulation/SimulationScreen.test.tsx
# FAIL: the new assertions expose the current enabled CTA, long option labels, and old completion phrase
```

### 2. Minimal implementation

- [x] Update `QualityScreen.tsx` heading and description usage, add `hasCompleteClaims`, add the incomplete-claim `LearningCallout`, set `disabled={!claimsReady}`, and keep dispatch action selection unchanged once claims are complete.
- [x] Update `RecoveryClaimPanel.tsx` with short option labels, token-content helper paragraphs, `aria-describedby`, and safe learner-facing port mapping.
- [x] Update `SimulationScreen.tsx` completion copy only.
- [x] Add `.claim-help` and quality narrow-screen spacing rules to `src/styles/simulation.css`; keep table semantics and 44px controls.
- [x] Add the dated 2026-08-31 entry to `src/content/updateHistory.ts`.

Expected implementation command and result:

```text
npm run test -- --run src/features/quality/QualityScreen.test.tsx src/features/quality/RecoveryClaimPanel.test.tsx src/features/simulation/SimulationScreen.test.tsx
# PASS: all focused learner-copy and claim-readiness tests
```

### 3. Regression and same-scenario verification

- [x] Update E2E selectors/assertions only where the learner-facing text intentionally changed; keep values and mission paths unchanged.
- [x] Run all unit, axe, build, and E2E commands below. The default local Playwright launcher is blocked by a missing bundled headless shell; the equivalent system-Chrome configuration passes all 19 tests.
- [x] Re-run cold entry, size mission, integrated one-step exploratory run, incorrect prediction, empty quality claims, complete claims, revision, report, update dialog, keyboard, and reduced-motion scenarios at 320×800, 375×812, and 1280×900.
- [x] Record post-change screenshots and exact dimensions in `work/elementary-webapp-ux-report.md`.

## Verification commands and expected results

These commands are planned execution steps for this cycle; they are not release commands.

```text
npm run test -- --run
# PASS: all existing and new unit/integration tests
npm run test:a11y
# PASS: jest-axe accessibility checks
npm run build
# PASS: TypeScript/Vite build creates dist/
npm run test:e2e -- --workers=1
# PASS: learner flow, mobile keyboard, privacy/safety, reduced motion, and redesign regressions
git diff --check
# PASS: no whitespace errors
```

Browser wrapper evidence:

```text
NPM_CONFIG_CACHE=/private/tmp/mixture-npm-cache /Users/kimhongnyeon/.codex/skills/playwright/scripts/playwright_cli.sh open http://127.0.0.1:4180/ --headed
# local Vite page title: 혼합물 분리 공정 설계소
NPM_CONFIG_CACHE=/private/tmp/mixture-npm-cache /Users/kimhongnyeon/.codex/skills/playwright/scripts/playwright_cli.sh resize 375 812
# documentElement.scrollWidth <= 375; quality CTA is reachable after target claims
NPM_CONFIG_CACHE=/private/tmp/mixture-npm-cache /Users/kimhongnyeon/.codex/skills/playwright/scripts/playwright_cli.sh resize 320 800
# no horizontal overflow; helper and controls remain readable
```

## Acceptance gate

- [x] No P0/P1 findings; EDU-UX-001, EDU-LANG-001, EDU-LANG-002, and EDU-UX-003 are `fixed` with same-state evidence.
- [x] Quality CTA is disabled and explanatory before all target claims, enabled after valid claims, and still dispatches the existing action.
- [x] No learner-facing raw IDs appear in stream options, helpers, headings, or buttons.
- [x] Simulation before/after scenes, token table, prediction comparison, and revision path are unchanged.
- [x] 320/375/1280 browser checks show no horizontal overflow, visible focus, and static reduced-motion output.
- [x] Update history displays the 2026-08-31 entry.
- [x] Unit, axe, build, system-Chrome E2E, and `git diff --check` commands exit 0; the default E2E launcher is documented as environment-blocked.
- [x] Final report states no commit/push/deploy/HVC was run and marks VoiceOver as excluded.

## Implementation status

Implementation and same-scenario verification are complete. See `work/elementary-webapp-ux-report.md` for the 96/100 acceptance score, browser metrics, the default Playwright cache blocker, and the remaining P3 entry-screen density follow-up.

## Future commit stages (do not execute here)

1. `docs: add elementary learner audit and scoped plan` — the four `work/elementary-webapp-ux-*.md` documents.
2. `fix: guide quality claims for elementary learners` — QualityScreen, RecoveryClaimPanel, simulation completion copy, styles, update history, and focused tests.
3. `test: record same-scenario learner verification` — E2E/regression updates and final report.

## Rollback

Revert only the scoped UI/copy/test files listed above. Leave `src/domain/**`, `src/simulation/runProcess.ts`, `src/simulation/quality.ts`, `src/state/**`, existing localStorage data, unrelated user changes, and release artifacts untouched.
