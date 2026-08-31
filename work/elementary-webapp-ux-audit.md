# Elementary Web App UX Audit

- Date: 2026-08-31
- Mode: `full`
- Target: `/Volumes/ External Drive 256G/Dev2/codex/mixture-separation-process-lab`
- Existing redesign plan: `work/education-webapp-redesign-plan.md`
- Stage 0: `ready` (`work/elementary-webapp-ux-bootstrap.md`)
- Scope: learner-facing clarity and recovery improvements only; domain, simulation, persistence, privacy, and safety contracts remain unchanged.

## Learner panel

This is a simulated comprehension panel, not research with children.

| Persona | Reason for selection | What the learner should be able to do |
| --- | --- | --- |
| 서윤, 초등 5–6학년 | The design document targets grades 5–6 and asks for evidence-based separation decisions. | Name the current step, choose a material box for every target, predict the next output, and explain what changed after a run. |
| 준호, 초등 3–4학년 guardrail | Lower-grade check catches unexplained abstract words without changing the target grade. | Find the next button and understand that a material box contains educational tokens. |

The panel uses the same click, keyboard, viewport, and cold-storage scenarios as the implementation tests. It does not certify actual student or teacher acceptance.

## Baseline evidence

| State | Evidence | Observation | Severity |
| --- | --- | --- | --- |
| Cold entry, 375×812 | `output/playwright/elementary-baseline-375-entry.png`; Playwright snapshot `page-2026-08-30T23-11-59-899Z.yml` | The title, seven-step journey, first mission card, and instruction are visible. The first complete mission choice and CTA require scrolling because the journey and safety note consume most of the first viewport. | P3 visual density |
| Cold entry, 1280×720 | `output/playwright/ux-baseline-desktop.png` | The light-mode hierarchy is clear, but the safety block extends below the fold before the target-selection action is available after a mission is selected. | P2 action distance |
| Integrated process, one-step plan | `output/playwright/ux-baseline-integrated-mobile.png`; `output/playwright/ux-baseline-design-selected.png` | A one-step exploratory plan can run. The completion message says “모든 단계를 실행했어요”, which is technically true for the drafted plan but can sound like the integrated mission itself is complete. | P2 wording risk |
| Quality, no recovery claims | Playwright snapshot `page-2026-08-30T23-13-25-302Z.yml` followed by `page-2026-08-30T23-13-31-471Z.yml` | The page displays “회수 주장을 세워 보세요”, an abstract phrase, and an enabled “문제 단계 수정하기” button even when no target material box has been selected. A learner can skip the observation task and enter revision immediately. | P2 language/recovery |
| Quality, 375×812 and 320×800 | Browser evaluation from the quality state | `document.documentElement.scrollWidth` stayed within the viewport, but `bodyHeight` was 1845 and the recovery CTA began at `top: 812.328`. The six-column quality table and long stream options make the recovery decision a long scroll. | P2 density |
| Keyboard, cold entry | Playwright snapshot after two Tab presses | The skip link and first mission radio receive visible focus in order. | Pass |
| Runtime and network | Playwright console and static request capture | 0 console errors, 0 warnings, and only local [200] requests in the baseline session. | Pass |

## Findings ledger

| ID | Finding | Evidence and learner impact | Priority | Planned disposition |
| --- | --- | --- | --- | --- |
| EDU-UX-001 | Quality can be advanced without completing target-to-box observations. | `QualityScreen` always enables its primary button; an empty `claims` array dispatches `begin-revision`. This skips the explicit “목표 물질마다 물질함을 선택” task shown by the shell. | P2 | Disable the primary action until every target has a valid active stream claim; show a short next-step hint. Keep reducer validation and revision recovery unchanged. |
| EDU-LANG-001 | “회수 주장을 세워 보세요” is abstract for the target grade. | `src/features/quality/QualityScreen.tsx` uses “회수 주장” while the learner is actually choosing a visible material box. | P2 | Use “결과를 보고 물질함을 골라요”; retain the scientific goal in the description and question. |
| EDU-LANG-002 | Select options repeat long token inventories. | `RecoveryClaimPanel.streamLabel` puts step, port, and every token count into each `<option>`, making scanning and keyboard selection harder. | P2 | Use a short option label (`n단계 · 이름 물질함`) and show the selected box’s token contents in a linked helper below the select. Do not expose IDs. |
| EDU-UX-002 | Quality result information is vertically dense on narrow screens. | The six-column ledger and long option labels push the recovery action beyond the first 812px. Horizontal overflow is currently avoided, so the change must preserve semantic table structure. | P2 | Keep the semantic table and add responsive cell spacing/line lengths plus the shorter stream labels; verify 320/375 height and CTA reachability. No duplicate hidden table is introduced. |
| EDU-UX-003 | Integrated one-step completion wording may overstate mission completion. | The simulator reports “모든 단계를 실행했어요” for the current draft, even when an integrated learner has drafted only one step. | P2 | Change the success title to “현재 공정의 단계를 모두 실행했어요” and add a sentence that the learner is now checking the boxes produced by this drafted process. No plan rule changes. |
| EDU-UX-004 | The first mobile viewport spends most of its height on orientation and safety copy. | At 375px the first mission is visible but the complete choice-to-CTA path is below the fold. | P3 | Record as a follow-up layout observation; do not move or remove safety content in this cycle because the existing safety placement is a contract and the issue is not blocking. |

## Comprehension probes

| State | Prompt to simulated learner | Baseline result | Target result |
| --- | --- | --- | --- |
| Quality before claims | “지금 무엇을 해야 하나요?” | The visible button invites revision, so the learner can answer “수정하러 가요” instead of choosing boxes. | “각 목표 물질이 남은 물질함을 하나씩 고른다.” The primary button is disabled and the hint names the missing action. |
| Quality after one claim | “다음에는 무엇을 고르나요?” | Long options require reading step, port, and token inventory at once. | The learner can scan short box names and read the selected box’s token summary below the control. |
| Quality heading | “회수 주장이 무엇인가요?” | The phrase is not explained by the UI. | The heading names the concrete action, “물질함을 골라요”; the domain term is not needed for this control. |
| Simulation completion | “모든 단계가 끝났다는 뜻인가요?” | One-step integrated plan can sound like the whole mission is done. | The revised title scopes completion to the drafted process and the next sentence directs the learner to inspect token boxes. |

## Baseline score (100-point gate)

| Area | Score | Basis |
| --- | ---: | --- |
| Learning goal and task clarity | 12/15 | Goal and current action are present, but quality action can be skipped. |
| Language readability and cognitive load | 14/20 | Short stage copy is strong; “회수 주장” and long options add avoidable load. |
| Screen structure and action hierarchy | 9/12 | One primary CTA per screen and clear progress; quality CTA state is misleading. |
| Feedback and recovery | 10/13 | Token before/after and revision path exist; empty-claim recovery does not explain the missing observation. |
| Visual readability | 8/10 | Light-mode contrast and cards are clear; narrow quality content is dense. |
| Keyboard, semantics, basic accessibility | 9/10 | Visible focus and semantic controls pass baseline checks. |
| Responsive learning flow | 7/10 | No horizontal overflow, but quality CTA and entry actions are below the first mobile viewport. |
| Runtime stability | 5/5 | No console errors or failed local requests observed. |
| Contextual visual assets and safety | 4/5 | CSS token visuals support the model and safety copy is present; no new educational asset is necessary. |
| **Total** | **78/100 (conditional)** | No P0/P1 was observed; P2/P3 findings remain. |

## Scope boundary

No VoiceOver test, TTS, narration, recording, external request, login, identifier collection, new dependency, image generation, commit, push, deployment, or HVC registration is part of this audit cycle.

## Final revalidation

| Finding | Final evidence | Status |
| --- | --- | --- |
| EDU-UX-001 / EDU-LANG-003 | At quality before a claim, the primary action is disabled and the hint says `각 목표 물질의 물질함을 먼저 골라 보세요.`; after `step-1:pass`, the action enables and the helper shows `선택한 물질함의 토큰: 고운 모래 9개`. | fixed |
| EDU-LANG-001 | Quality heading is `결과를 보고 물질함을 골라요` in `page-2026-08-30T23-27-08-002Z.yml`. | fixed |
| EDU-LANG-002 / EDU-UX-002 | Options are `1단계 · 통과 물질함` and `1단계 · 잔류 물질함`; the narrow ledger is a labeled stacked card in `output/playwright/elementary-quality-final-375.png` and `output/playwright/elementary-quality-final-320.png`. | fixed |
| EDU-UX-003 | Simulation completion reads `현재 공정의 단계를 모두 실행했어요` and directs the learner to inspect token boxes. | fixed |
| EDU-UX-004 | Initial entry still uses a tall orientation/safety block; the first complete choice-to-CTA path may require a scroll at 375px. | open P3 follow-up |

The final simulated learner panel could name the next action, select a stream, read exact token counts, and continue. It could also complete all four mission keyboard flows without horizontal overflow. This is observable evidence, not actual child research.

## Final score

| Area | Score | Basis |
| --- | ---: | --- |
| Learning goal and task clarity | 15/15 | Result heading, shell instruction, guiding question, and claim hint name the learner action. |
| Language readability and cognitive load | 19/20 | Abstract heading and long options were replaced; a small amount of science vocabulary remains intentionally. |
| Screen structure and action hierarchy | 12/12 | One primary action remains and its disabled/enabled state now matches the claim task. |
| Feedback and recovery | 13/13 | Before/after movement, token table, prediction comparison, claim hint, and revision path are present. |
| Visual readability | 9/10 | Narrow quality rows are labeled cards; the initial orientation block remains tall. |
| Keyboard, semantics, basic accessibility | 10/10 | Native controls, visible focus, `aria-describedby`, axe, and four 375px keyboard flows pass. |
| Responsive learning flow | 8/10 | 320/375/1280 have no horizontal overflow and the full-page CTA is reachable; initial entry still needs a scroll. |
| Runtime stability | 5/5 | Custom system-Chrome run reported no page errors, console errors, or external requests. |
| Contextual visual assets and safety | 5/5 | Existing CSS token visuals and safety boundary remain; no new image is necessary. |
| **Total** | **96/100** | App acceptance passes; default Playwright launcher remains environment-blocked as described in the report. |
