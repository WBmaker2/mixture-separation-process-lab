# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

주 사용자는 한국어를 읽는 초등학교 5~6학년 학습자입니다. 브라우저에서 혼합물 분리 문제를 스스로 관찰하고 결과를 설명할 수 있어야 합니다.

## Product Purpose

혼합물을 이루는 물질의 관찰 가능한 성질을 근거로 분리 공정을 설계하고, 토큰의 이동과 결과를 확인하는 결정적 가상 학습 도구입니다. 성공은 학습자가 미션 선택부터 결과 기록까지의 흐름을 따라가며 성질과 공정 순서의 관계를 설명하는 것입니다.

## Positioning

정답 버튼을 고르는 퀴즈가 아니라, 성질 근거·물질함 흐름·토큰 이동·결과 판정을 연결해 여러 공정 해법을 비교하게 하는 가상 분리 설계소입니다.

## Operating Context

학습자는 미션과 목표 물질을 고르고, 성질을 확인하고, 공정 순서를 구성한 뒤 각 단계의 출력을 예측합니다. 가상 실행 후 회수·혼입·미회수·손실 결과를 점검하고, 필요하면 공정을 수정해 보고서와 생활 속 성찰을 남깁니다.

## Capabilities and Constraints

- Vite + React + TypeScript 정적 SPA이며 네트워크 없이 동작합니다.
- 네 가지 미션, 네 가지 분리 방법, 두 가지 준비 행동과 결정적 토큰 시뮬레이션을 제공합니다.
- 결과 판정과 localStorage 저장은 기존 `src/domain/**`, `src/simulation/**`, `src/state/**` 계약을 따릅니다.
- 이름·이메일·로그인·온라인 공유·외부 AI API·분석·외부 폰트·원격 이미지를 수집하거나 호출하지 않습니다.
- 실제 물질의 양·온도·시간·순도·수율이나 위험한 절차를 안내하지 않습니다.
- 학생 대상 TTS·내레이션·음성 재생·녹음은 제공하지 않습니다.

## Brand Commitments

제품명은 `혼합물 분리 공정 설계소`이며, 한국어의 짧고 구체적인 문장을 사용합니다. 화면은 밝은 라이트 모드와 CSS 토큰 패턴으로 물질을 표현하고, `업데이트 내역` 기록을 제공합니다.

## Evidence on Hand

- 교육 목표와 상태·판정·안전 경계: `work/education-webapp-redesign-plan.md`
- 현재 학습 흐름과 UX 근거: `work/education-webapp-redesign-audit.md`
- 결정적 콘텐츠·시뮬레이션·저장 계약: `src/domain/**`, `src/simulation/**`, `src/state/**`
- 정체성 자산: `public/favicon.svg`
- 외부 이미지·사진·도식은 현재 제공하지 않으며 새 이미지가 학습 역할을 갖는다는 근거도 없습니다.

## Product Principles

1. 성질을 먼저 관찰하고 공정 행동을 선택합니다.
2. 토큰의 전후 이동과 상태표로 결과를 확인합니다.
3. 정답보다 근거와 수정 이유를 기록합니다.
4. 가상 모델의 한계와 실제 실험의 안전 경계를 분명히 합니다.
5. 학습 흐름은 키보드·모바일·일반 스크린 리더 semantics로도 이해할 수 있어야 합니다.

## Accessibility & Inclusion

키보드로 전체 미션을 완료할 수 있고, 현재 단계·오류·완료 상태를 semantic HTML과 적절한 ARIA로 전달합니다. 버튼과 입력은 최소 44px 조작 영역, visible focus, 375px 좁은 화면 흐름, `prefers-reduced-motion` 대체 표현을 지원합니다. VoiceOver 제품 구현과 검증은 범위에 포함하지 않습니다.
