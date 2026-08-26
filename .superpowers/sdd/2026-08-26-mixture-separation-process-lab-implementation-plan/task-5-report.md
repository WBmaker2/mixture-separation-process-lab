# Task 5 구현 보고서

## 구현

- `RecoveryClaim`을 domain 계약에 추가했습니다.
- 계획 검증(중복 ID, 허용되지 않은 행동, 근거 불일치/미확인, 미래·누락 입력, 이중 소비)을 결정론적으로 구현했습니다.
- 유효한 단계만 순차 실행하고, 소비 스트림·출력 병합·활성 잎·토큰 최종 위치를 불변 상태로 계산합니다.
- 통합 계획 생성기, 토큰 기반 품질 계산, 결과 기반 승인, 우선순위 추적 질문을 추가했습니다.
- 모든 소스 파일은 500줄 미만입니다.

## TDD 및 검증

- 실패 확인: `npm run test -- src/simulation/runProcess.test.ts`에서 모듈 미존재 실패 확인
- 집중 테스트: `npm run test -- src/simulation/runProcess.test.ts` — 5 tests passed
- simulation 전체: `npm run test -- src/simulation` — 3 files, 19 tests passed
- 전체 테스트: `npm run test` — 5 files, 25 tests passed
- 빌드: `npm run build` — TypeScript 및 Vite build 성공

## 커밋

Task 5 파일만 단일 커밋으로 기록합니다.

## 리뷰 수정 라운드 1

- 존재하지 않는 claim stream은 무효 claim으로 처리하여 회수·혼입을 0으로 하고 `missing-claim`을 발생시킵니다.
- 정적 출력 포트에 `unchanged`를 추가하고, 실제 실행에서 없는 포트·소비 스트림은 중복 없이 동적 `PlanIssue`로 기록합니다.
- no-basis 정상 포트 참조 및 실제 누락 포트 회귀 테스트를 추가했습니다.
- 집중 테스트 8건, simulation 전체 22건, 전체 테스트 28건 통과; 빌드 성공.
- 수정 커밋 SHA: `REVIEW_SHA_PENDING`
- 남은 우려: 없음.
