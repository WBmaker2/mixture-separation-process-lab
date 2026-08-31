# Simulation Decision Ledger

- Date: 2026-08-31
- Existing simulation: deterministic DOM/React token movement in `src/simulation/**` and `src/features/simulation/**`.
- New simulation decision: `not-needed`.
- Reason: the current simulation already makes the curriculum loop observable—predict one output, run one process step, inspect before/after token boxes and the token table, compare prediction, then revise or report. A Canvas, WebGL, game loop, data-visualization plugin, or new asset would add implementation surface without improving this learning objective.

## Existing model contract to preserve

| Contract | Evidence | Revalidation |
| --- | --- | --- |
| Deterministic token movement | `src/simulation/runProcess.ts`, `src/simulation/applyProcessStep.ts`, `src/simulation/tokenFactory.ts` | Same mission, plan, prediction, and claim values produce the same quality summary in unit tests. |
| One meaningful variable per step | `src/domain/actions.ts`, `src/features/simulation/PredictionPrompt.tsx` | One prediction radio is required before each step button enables. |
| Observation and explanation | `src/features/simulation/MovementScene.tsx`, `src/components/TokenStatusTable.tsx`, `src/simulation/movementCopy.ts` | Before/after scenes, status table, and comparison text remain visible after each run. |
| Reset and retry | `src/state/labReducer.ts` revision actions and `ProcessBoardScreen` restore controls | A failed quality claim still leads to a revision path without exposing an answer sequence. |
| Model boundary | `src/content/safety.ts`, `SafetyNotice`, report notice | No mass, temperature, time, purity, yield, or real heating instructions are introduced. |
| Keyboard, touch, reduced motion | existing Playwright keyboard/reduced-motion specs and `src/hooks/useReducedMotion.ts` | Rerun 375px keyboard and reduced-motion scenarios after copy/quality changes. |

## Control applicability

- `pause`: N/A. The interaction is a one-shot process-step action; no autonomous time-based state runs.
- `step`: N/A as a new control. The UI already exposes one process step and one prediction at a time, so an additional temporal stepper would duplicate the learning unit.
- `seed/time`: N/A for new work. Existing `runProcess` is deterministic from the selected mission and plan.
- Canvas/WebGL/game-playtest: N/A. Existing DOM token scenes are accessible, inspectable, and sufficient at 320/375px.

## Gate

The simulation gate applies to revalidation only. It is not a reason to add a new visualization. The same scenario must still pass prediction → action → observation → explanation → revision/report, with static reduced-motion output and no new external assets.
