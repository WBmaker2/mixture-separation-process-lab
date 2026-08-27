# Task 8 구현 보고서

## 구현 내용

- 버튼만 사용하는 `ProcessBoardScreen`과 `ActionCard`, `ProcessSlot`, `ProcessPreview`를 추가했습니다.
- `EXPECTED_PORTS`/`getExpectedPorts`로 행동별 출력 포트 계약을 고정하고, 미션 허용 행동·확인 성질에 따른 선택 게이트를 적용했습니다.
- 단계 입력은 radio로 선택하며 첫 단계는 initial 스트림, 이후 단계는 앞 단계 출력 포트를 참조합니다. 숫자 최대값 기반 `step-N` ID를 사용합니다.
- 체 간격 radio, 교체·위/아래 이동·삭제·실행 취소·최초 공정 복원, 끊어진 입력 경고를 구현했습니다.
- `validatePlan` 오류를 alert로 보여 주고 유효한 준비 버튼만 한 번 pulse하며 `start-simulation`을 dispatch합니다.
- design/revision stage를 App에 연결하고 revision 최초 공정 요약과 질문을 추가했습니다. 실제 실험·네트워크·이름 입력·드래그앤드롭은 추가하지 않았습니다.

## TDD 및 검증

- RED: `npm run test -- src/features/process-board/ProcessBoard.test.tsx` — `ProcessBoardScreen` unresolved import 실패 확인.
- GREEN: `npm run test -- src/features/process-board/ProcessBoard.test.tsx` — 3 tests passed.
- Reducer 회귀: `npm run test -- src/features/process-board/ProcessBoard.test.tsx src/state/labReducer.test.ts` — 8 tests passed.
- 전체: `npm run test` — 10 files, 51 tests passed.
- 빌드: `npm run build` — TypeScript 및 Vite build 성공.
- `git diff --check` — 성공.
- 변경 파일은 모두 500줄 미만입니다(최대 `ProcessBoard.test.tsx` 73줄).

## 변경 파일

- `src/features/process-board/ActionCard.tsx` (26줄)
- `src/features/process-board/ProcessBoardScreen.tsx` (56줄)
- `src/features/process-board/ProcessPreview.tsx` (11줄)
- `src/features/process-board/ProcessSlot.tsx` (12줄)
- `src/features/process-board/ProcessBoard.test.tsx` (73줄)
- `src/App.tsx`, `src/main.tsx`, `src/styles/components.css`, `src/styles/layout.css`

## 명시적으로 bounded follow-up

- revision 사유 입력·완료 가드는 Task 10에서 board를 확장하는 범위로 남겨 두었습니다.
- 실제 브라우저/모바일 learner-flow 검증은 Task 12–13 범위입니다.

## Fix round 1

- 교체 시 기존 `stepId`와 원래 입력 `StreamRef`를 보존하도록 고정했습니다.
- 삽입/교체 대상보다 앞선 단계의 출력만 radio 선택지로 노출합니다.
- 성질 안내를 미확인 허용 행동 기준으로 계산하고 `role="alert"`, `tabIndex=0`으로 접근 가능하게 했습니다.
- 삭제·미래 참조 모두에 연결 복구 경고를 표시합니다.
- 회귀 테스트 3건을 추가했습니다(교체 입력 보존, 미래 입력 미노출, 미래/삭제 참조 경고, 미션별 안내).

Fix round 1 검증: focused 11/11, full 54/54, build PASS, `git diff --check` PASS, 최대 파일 104줄.

## Fix round 2

- 기존 단계의 `교체` 모드에서 다른 허용 행동 카드를 선택해도 `replace-step`과 기존 ID·입력 참조를 유지합니다.
- 끊어진 입력 경고를 `tabIndex=0`으로 만들어 키보드 포커스가 가능하도록 했습니다.
- integrated plan의 행동 변경 교체 및 경고 포커스 회귀 테스트를 추가했습니다.

Fix round 2 검증: focused/reducer 12/12, full 55/55, build PASS, `git diff --check` PASS, 최대 파일 116줄.

## Fix round 3

- 입력 radio 라벨을 `{목표 단계}단계 입력: {출처 단계}단계의 {출력}` 형식으로 정정했습니다.
- 2단계 삽입 라벨과 미래 단계 선택지 미노출 회귀 테스트를 추가했습니다.

Fix round 3 검증: focused/reducer 13/13, full 56/56, build PASS, `git diff --check` PASS, 최대 파일 125줄.

## Fix round 4

- `ProcessPreview`에 인접 단계 사이에만 aria-hidden 세로 화살표 연결자를 추가했습니다.
- 연결자는 마지막 단계 뒤에 렌더링되지 않으며, 단계별 예상 출력 라벨과 토큰/성공 수치 비공개 원칙을 유지합니다.
- 2단계 미리보기 연결자 회귀 테스트를 추가했습니다.

Fix round 4 검증: focused/reducer 14/14, full 57/57, build PASS, `git diff --check` PASS, 최대 파일 135줄.

## Fix round 5

- `ProcessPreview`의 ordered list 직접 자식을 실제 공정 단계 `li`로만 정리했습니다.
- 연결 화살표는 비마지막 단계 `li` 내부의 aria-hidden `span`으로 렌더링하여 목록 번호 아티팩트를 제거했습니다.
- 2단계 연결자와 직접 자식 구조 회귀 테스트를 보강했습니다.

Fix round 5 검증: focused/reducer 14/14, full 57/57, build PASS, `git diff --check` PASS, 최대 파일 138줄. 테스트 출력에 React key warning 없음.
