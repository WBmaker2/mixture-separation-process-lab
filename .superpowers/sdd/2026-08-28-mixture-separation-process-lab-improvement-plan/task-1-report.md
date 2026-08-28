# Task 1 보고서

상태: DONE

## 변경 파일

- `src/simulation/prediction.ts`: 선택 목표 물질 탐색, 최다 목적지 기대 포트, 예측 판정, 동적 질문을 추가했습니다.
- `src/simulation/prediction.test.ts`: 목표별 출력·소수 손실·no-basis·질문·목표 선택 계약을 추가했습니다.
- `src/features/simulation/SimulationScreen.tsx`: 선택 목표를 기준으로 질문과 결과 판정을 연결했습니다.
- `src/features/simulation/PredictionPrompt.tsx`: 목표 물질명 기반 질문으로 바꾸고 정답 힌트를 제거했습니다.
- `src/simulation/feedback.ts`, `src/features/quality/QualityScreen.tsx`: 목표별 안내 질문을 연결했습니다.
- `src/App.tsx`, `src/accessibility/App.a11y.test.tsx`: 새 SimulationScreen 입력을 연결했습니다.
- `src/features/simulation/SimulationScreen.test.tsx`: 오답 층 선택 및 힌트 제거 회귀를 고정했습니다.

## 테스트

- 실패 확인: `npm test -- src/simulation/prediction.test.ts src/features/simulation/SimulationScreen.test.tsx src/features/quality/QualityScreen.test.tsx` — 새 모듈 import 실패로 실패.
- 지정 테스트: 같은 명령 — 3개 파일, 15개 테스트 통과.
- 빌드: `npm run build` — TypeScript 및 Vite 빌드 통과.
- 전체 테스트: `npm test -- --run` — 16개 파일, 83개 테스트 통과.

## 커밋

SHA: `e312a9d536306badb561a1a754efa1ec64d6c498`

메시지: `fix: evaluate predictions for the selected material`

## 남은 우려

- 브라우저·수동 학습자 검수와 배포 검증은 이번 작업 범위가 아니므로 수행하지 않았습니다.
- 저장소에 있던 `.gstack/`, `.playwright-mcp/`, `output/` 미추적 산출물은 커밋하지 않았습니다.
