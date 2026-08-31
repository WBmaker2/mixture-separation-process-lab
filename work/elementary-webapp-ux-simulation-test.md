# Simulation Revalidation Test Ledger

- Date: 2026-08-31
- Decision: existing deterministic DOM simulation; no new simulation implementation.
- Status: revalidated after the planned copy and quality-gating changes. No simulation rule or token movement code changed.

| Check | Scenario and exact assertion | Baseline | Target |
| --- | --- | --- | --- |
| Predict before run | At simulation stage, `1단계 가상 실행` is disabled until one output radio is selected. | observed in snapshot `page-2026-08-30T23-13-00-625Z.yml` | pass |
| Observe movement | After the run, `before-scene`, `after-scene`, token status table, and prediction comparison are visible. | observed in snapshot `page-2026-08-30T23-13-07-961Z.yml` | pass |
| Explain and recover | Quality asks for target-to-box claims; an incomplete claim set must explain the missing action before revision. | empty claims could skip directly to revision | pass: focused test and system-Chrome E2E |
| Reduced motion | With `prefers-reduced-motion: reduce`, no moving token layer is rendered and the before/after result remains visible. | existing `e2e/reduced-motion.spec.ts` passed in prior release baseline | pass: full 19-test system-Chrome E2E |
| Determinism | Existing `runProcess` and quality unit tests keep identical token counts for the same plan. | existing unit suite passed in prior release baseline | pass: 23 files / 109 tests |
