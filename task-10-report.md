# Task 10 보고서

## 범위

품질 검사 화면, 교육용 토큰 회수 주장, 품질 장부, 문제 단계 안내, 수정 이유 입력과 수정 완료 가드를 구현했습니다.

## TDD 및 검증

- 지정 QualityScreen 테스트를 먼저 작성하고 `QualityScreen` 모듈 부재 RED를 확인했습니다.
- 최소 구현 후 focused quality/reducer/runProcess 테스트: PASS (17 tests)
- 전체 테스트: PASS (12 files, 65 tests)
- `npm run build`: PASS
- `git diff --check`: PASS

## 변경 파일

- `src/features/quality/RecoveryClaimPanel.tsx`
- `src/features/quality/QualityLedger.tsx`
- `src/features/quality/QualityScreen.tsx`
- `src/features/quality/QualityScreen.test.tsx`
- `src/features/process-board/ProcessBoardScreen.tsx`
- `src/App.tsx`
- `src/state/labReducer.test.ts`
- `src/styles/components.css`

## 후속 확인

브라우저에서 실제 학습자 흐름(초기 공정 → 가상 실행 → 품질 검사 → 수정 공정)을 한 번 확인하고, 수정 공정의 두 번째 실행 완료 뒤 보고서 진입을 확인할 수 있습니다.
