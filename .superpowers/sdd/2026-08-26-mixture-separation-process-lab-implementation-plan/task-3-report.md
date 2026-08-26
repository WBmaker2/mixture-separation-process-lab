# Task 3 구현 보고서

## 상태

완료

## 구현

- 미션 정의의 초기 물질을 물질당 10개씩 결정론적으로 생성하고, 두 자리 순번 토큰 ID를 부여했습니다.
- 초기 스트림 및 단계 출력 스트림 참조를 구현했습니다.
- `add-water`에서 운반수 10개를 추가하고 소금 토큰을 `dissolved`로 전환하도록 구현했습니다.
- `wait-for-layers`에서 물·기름 토큰을 확인하고 층 관찰 상태를 출력하도록 구현했습니다.
- 근거가 없는 경우 토큰을 모두 `unchanged` 스트림으로 추적하는 공통 결과를 구현했습니다.

## 검증

- 실패 테스트 확인: 모듈 미존재 import 오류 확인
- 집중 테스트: `npm run test -- src/simulation/preparation.test.ts` — 3 tests passed
- 전체 테스트: `npm run test` — 3 files, 9 tests passed
- 빌드: `npm run build` — 성공
- 소스 파일 최대 길이: 45줄

## 남은 우려

- 후속 분리 규칙 구현에서 `ProcessOutput.condition`과 `ProcessOutput.stream.condition` 중 어느 표현을 정본으로 사용할지 기존 계약과 일관성을 확인해야 합니다. 현재는 두 위치를 함께 제공합니다.

## 리뷰 수정 라운드 1

- `ProcessOutput.condition` 중복 필드를 제거하고 `stream.condition`을 정본으로 통일했습니다.
- `wait-for-layers`가 물·기름 외 토큰이 포함된 입력을 성공 처리하지 않도록 정확한 물질 집합 검사를 추가했습니다.
- 운반수 토큰은 `addedTokenIds`로만 기록하고 기존 입력 토큰만 이동 기록에 포함하도록 수정했습니다.
- 회귀 집중 테스트: `npm run test -- src/simulation/preparation.test.ts` — 4 tests passed
- 전체 테스트: `npm run test` — 3 files, 10 tests passed
- 빌드: `npm run build` — 성공
- 수정 커밋: `fix: tighten preparation token tracking` (최종 SHA는 완료 응답 참조)

### 남은 우려

- 후속 분리 규칙이 `stream.condition`만 사용하도록 동일한 계약을 적용해야 합니다.
