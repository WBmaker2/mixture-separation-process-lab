# Elementary Learner Language Audit

- Date: 2026-08-31
- Target grade: 초등 5–6학년 (초3–4 guardrail only)
- Method: runtime text inventory plus same-state comprehension probes; `work/elementary-webapp-ux-language-candidates.md` remains triage-only evidence.
- Accuracy boundary: scientific terms, token counts, output ports, and safety facts are preserved. No simplified phrase changes the reducer or quality rule.

| issue-id | screen/state | surface | source/evidence | static or dynamic | learner-facing | before | difficulty signals | after | learning intent preserved | curriculum terms and facts preserved | comprehension probe | visual readability link | verification state | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EDU-LANG-001 | quality / after simulation | heading | `src/features/quality/QualityScreen.tsx:24`; snapshot `page-2026-08-30T23-13-25-302Z.yml`; final `output/playwright/elementary-quality-final-375.png` | static | yes | 결과를 살펴보고 회수 주장을 세워 보세요 | abstract-or-formal; the visible action is choosing a box, not writing an argument | 결과를 보고 물질함을 골라요 | yes | yes; “물질함”, token movement, and the guiding question remain | Learner restatement: “결과를 보고 목표 물질이 있는 물질함을 고른다.” | none | confirmed by unit, E2E, and 375px browser snapshot | fixed |
| EDU-LANG-002 | quality / stream select | option and helper | `src/features/quality/RecoveryClaimPanel.tsx:9,21`; final snapshots `page-2026-08-30T23-27-08-002Z.yml` and `page-2026-08-30T23-33-56-226Z.yml` | dynamic | yes | `1단계 잔류: 큰 자갈 10개, 고운 모래 1개` (repeated for every option) | long-or-dense; technical-or-internal step/port detail competes with the choice | option: `1단계 · 잔류 물질함`; linked helper: `선택한 물질함의 토큰: 큰 자갈 10개, 고운 모래 1개` | yes | yes; counts and material names stay exact, only presentation moves from option to helper | Learner scans two short options, selects one, then names the token contents shown below. | EDU-UX-002 | confirmed by unit, E2E, and 320/375px browser checks | fixed |
| EDU-LANG-003 | quality / no claims | hint and primary button | `src/features/quality/QualityScreen.tsx:20,24`; final snapshot `page-2026-08-30T23-27-08-002Z.yml` | dynamic | yes | enabled `문제 단계 수정하기` with no claim-specific explanation | missing-recovery; action result does not match the shell instruction | hint: `각 목표 물질의 물질함을 먼저 골라 보세요.`; same button disabled until all target claims are present | yes | yes; it does not reveal an answer or change quality evaluation | Learner states the missing action and sees the button become enabled only after each target select has a value. | EDU-UX-001 | confirmed by focused unit, E2E, and keyboard flows | fixed |
| EDU-UX-003 | simulation / completed drafted process | completion callout | `src/features/simulation/SimulationScreen.tsx:38`; final snapshot `page-2026-08-30T23-26-43-288Z.yml` | dynamic | yes | 모든 단계를 실행했어요 | ambiguous-reference; “모든 단계” can be heard as the whole integrated mission | 현재 공정의 단계를 모두 실행했어요 | yes | yes; completion is explicitly scoped to the drafted process | Learner answers that the current drafted process finished and the next action is inspecting token boxes. | EDU-UX-003 | confirmed by simulation unit and full system-Chrome E2E | fixed |

## Language guardrails

- Keep domain terms `물질함`, `토큰`, `알갱이 크기`, `물에 녹는 성질`, `거름`, and `가상 증발` intact.
- Do not expose `step-*`, port IDs, reducer state, validation, or storage keys in learner-facing text.
- Keep error recovery action-oriented; never replace a hint with only “틀렸어요” or “실패했어요”.
- Keep safety facts in `SafetyNotice` and action-specific guidance; this audit does not remove teacher guidance.
