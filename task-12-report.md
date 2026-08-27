# Task 12 report — 모바일·키보드·스크린 리더·모션 감소 검증

## 완료 내용

- `jest-axe`와 Playwright Chromium 검증 도구 및 `test:a11y`, `test:e2e` 스크립트를 추가했습니다.
- skip link와 main landmark semantics, 테스트 cleanup/matchMedia mock, 포커스 대비, 44px 조작 영역을 보강했습니다.
- 표를 독립 스크롤 wrapper로 감싸고 페이지 가로 overflow를 차단했습니다.
- reduced-motion에서 pulse·transition을 끄고 MovementScene의 정적 전·후 장면 계약을 E2E로 확인했습니다.
- 네 미션의 375px keyboard entry fixture와 VoiceOver 수동 검수표를 추가했습니다.

## 검증 결과

| 명령 | 결과 |
|---|---|
| `npm run test:a11y` | PASS — 2 tests |
| `npm test` | PASS — 15 files, 73 tests |
| 초기 범위 `npm run test:e2e -- e2e/mobile-keyboard.spec.ts e2e/reduced-motion.spec.ts` | PASS — Chromium 5 tests (초기 entry/reduced-motion 범위, 전체 미션 완료 아님) |
| `npm run build` | PASS — Vite production build |
| `git diff --check` | PASS |

Playwright Chromium은 로컬 런타임에서 정상 실행되었습니다. VoiceOver 행은 실제 macOS VoiceOver 사용자가 브라우저에서 확인해야 하는 수동 검수 항목이며, 기록 날짜는 브리프 요구에 따라 `2026-08-26`으로 남겼습니다.

## Fix round 1 (2026-08-27)

- QualityLedger도 `table-scroll` region으로 감싸고 페이지 전체 overflow를 유발하던 `html { overflow-x: hidden; }` 마스킹을 제거했습니다. 실제 토큰 장면의 모바일 min-width 제약을 줄였습니다.
- 실행 준비·품질·보고서 단계의 강조 행동에도 `data-attention="true"`를 연결했습니다.
- reduced-motion 테스트는 키보드로 실제 size-sort 공정을 실행한 뒤 저장된 `currentRun`이 non-null인지 확인하고 reload합니다.
- 수동 검수표에 `확인 상태`를 추가했고 VoiceOver는 `사용자 확인 필요(미실행)`으로 명시했습니다.
- 초기 범위에서는 4개 모바일 entry와 reduced-motion을 합쳐 5 tests가 통과했지만, 이는 전체 미션 완료를 검증하지 않는 초기 범위였습니다. Fix round 1에서 `mobile-keyboard.spec.ts`를 네 미션의 intake→properties→design→simulation→quality→report(통합은 revision 포함) 전체 키보드 경로로 확장했습니다. 현재 full mission E2E는 claim 선택/품질 판정 단계에서 실패하여 통과로 주장하지 않습니다. 이는 브라우저 런타임 장애가 아닌 앱 흐름/테스트 계약 불일치입니다.

Fix round 1 검증: `npm run test:a11y` PASS (2), `npm test` PASS (15 files/73), `npm run build` PASS, `git diff --check` PASS. reduced-motion Chromium은 PASS; full mobile keyboard는 실패 상태입니다.

## Fix round 2 (2026-08-27)

Properties liquid fixture의 중복 `/층/` 토글을 canonical `서로 섞이지 않음과 층` checkbox 하나로 교정했습니다. QualityLedger wrapper와 실제 모바일 scene min-width 제약은 유지했고, select helper는 허용된 Space→ArrowDown→Enter 키 sequence와 DOM value assertion을 사용합니다. `html` overflow 숨김 마스킹은 제거된 상태입니다.

현재 full mobile mission suite는 아직 통과하지 않았습니다. Chromium에서 claim select keyboard sequence가 React select value로 반영되지 않아 품질 단계에 도달하지 못하는 실패가 재현되어, 성공으로 주장하지 않습니다. reduced-motion은 실제 키보드 실행 후 persisted `currentRun` non-null 검증을 포함해 통과합니다.

## Fix round 3 (2026-08-27)

- `RecoveryClaimPanel`의 native select에 ArrowDown 키보드 계약을 연결해 React reducer가 claim을 저장하도록 했습니다. Space/ArrowDown/Enter 후 DOM value를 assertion합니다.
- 미션별 canonical input stream과 action별 prediction 배열을 사용하고, integrated는 최초 `넓은 간격`과 revision `중간 간격`을 분리했습니다.
- 단일 worker Chromium에서 mobile keyboard 4/4 PASS가 확인되었습니다. 병렬 재실행은 macOS Chromium MachPort rendezvous 권한 오류로 브라우저 런타임에서 조기 종료되었고 앱 회귀로 분류하지 않습니다.
- 단일 worker 기준 `npm run test:e2e -- e2e/mobile-keyboard.spec.ts`는 4/4 PASS입니다. reduced-motion은 앞선 실제 실행 후 persisted `currentRun` 검증 PASS 이력이 있으며, 이후 병렬/재실행에서는 macOS Chromium MachPort 권한 오류가 발생했습니다.
