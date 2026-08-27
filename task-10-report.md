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

## Fix round 1

- quality stage는 persisted `currentRun`이 없으면 안전한 경고 화면만 표시합니다.
- 회수 주장은 현재 실행의 active leaf와 미션 목표를 reducer에서 검증하고, 품질 계산도 stale/unknown stream을 거부합니다.
- 문제 단계 카드는 정답 행동명을 숨기고 단계 번호와 관찰 질문만 제공합니다.
- 목표 물질 목록을 미션 허용 목표로 정규화했습니다.
- 수정 단계의 이유/변경 공정 조건이 충족될 때만 가상 실행 준비를 허용합니다.
- 추가 회귀 테스트 포함: focused 19 tests, 전체 67 tests PASS; build 및 diff check PASS.
