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
