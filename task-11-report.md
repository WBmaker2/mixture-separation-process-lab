# Task 11 보고서

## 범위

최초·수정 공정 보고서, 공정 비교, 날짜별 업데이트 내역 대화상자, 인쇄 스타일, 통합 미션 2차 실행 가드를 연결했습니다.

## TDD 및 검증

- 지정 `ReportScreen`·`UpdateHistoryDialog` 테스트를 먼저 추가하고 컴포넌트 미존재 RED를 확인했습니다.
- focused 보고서/업데이트/reducer 테스트: PASS (11 tests)
- 전체 테스트: PASS (14 files, 71 tests)
- `npm run build`: PASS
- `git diff --check`: PASS

## 변경 파일

- `src/content/updateHistory.ts`
- `src/components/UpdateHistoryDialog.tsx` 및 테스트
- `src/features/report/ProcessComparison.tsx`, `ReportScreen.tsx` 및 테스트
- `src/styles/print.css`, `src/styles/components.css`
- `src/App.tsx`, `src/components/AppShell.tsx`, `src/main.tsx`
- `src/state/labReducer.test.ts`

## 후속 확인

브라우저에서 통합 미션의 최초 실행 → 수정 → 두 번째 실행 → 보고서와 모바일 인쇄 화면을 확인합니다. 보고서의 textarea 내용은 현재 기기에만 저장됩니다.

## Fix round 1

- 고정 업데이트 내역 버튼이 보고서 하단을 가리지 않도록 safe-area를 포함한 하단 여백을 확보했습니다.
- 공정 단계마다 분리 방법/준비 행동 범주를 표시하고, 비통합 보고서에서도 최초 공정 전체 목록을 유지했습니다.
- 보고서의 인쇄 버튼에 `gi-pulse`를 적용하고 수정 회귀 테스트를 추가했습니다.
- focused 11 tests, 전체 71 tests, build, diff check 모두 PASS; 변경 파일은 500줄 미만입니다.

## Fix round 2

- 비통합 미션도 제공된 완료 근거를 `완료 근거`로 표시하도록 보완했습니다.
- 2026-08-27 개선 업데이트 기록을 추가하고 대화상자 회귀 검사를 확장했습니다.
