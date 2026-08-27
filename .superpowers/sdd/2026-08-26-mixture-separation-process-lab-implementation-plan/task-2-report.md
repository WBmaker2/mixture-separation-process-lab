# Task 2 구현 보고서

## 구현

- `src/domain/contracts.ts`에 고정 ID 유니온, `ProcessStep` 판별 유니온, 물질·성질·행동·미션 타입을 추가했습니다.
- `src/domain/materials.ts`에 정확히 5개 물질을 등록했습니다. 각 물질은 색 토큰 외에 무늬·모양 단서와 교육용 속성을 가집니다.
- `src/domain/properties.ts`에 지정 순서의 5개 성질 카드를 등록했습니다.
- `src/domain/actions.ts`에 4개 분리 방법과 2개 준비 행동을 등록했습니다. 여과는 용해도와 거름 행동을 모두 요구하며, 가상 증발은 실제 가열·온도·시간을 다루지 않습니다.
- `src/domain/missions.ts`에 정확히 4개 미션과 10 토큰 시작 계약을 등록하고 `getMission`을 추가했습니다.
- `src/content/safety.ts`에 가상 모델·교사 안전·변이 경계 문구를 추가했습니다.
- `src/domain/content.test.ts`에 콘텐츠 수·ID·교육 단서·미션 목표·안전 경계를 고정하는 5개 테스트를 추가했습니다.

## RED / GREEN 검증

RED:

```text
$ npm run test -- src/domain/content.test.ts
Error: Failed to resolve import "./actions" from "src/domain/content.test.ts".
```

GREEN:

```text
$ npm run test -- src/domain/content.test.ts
Test Files  1 passed (1)
Tests       5 passed (5)
```

```text
$ npm run build
✓ 17 modules transformed.
✓ built in 136ms
```

## 셀프 리뷰 및 우려

- 모든 신규 파일은 500줄 미만이며 React UI, 서버, 로그인, 센서, 카메라, 외부 AI를 추가하지 않았습니다.
- 미션 4는 선택 대상 없이 세 물질 전체 회수 목표로 고정했습니다.
- 후속 시뮬레이션 작업에서 `filtration`의 두 필수 성질을 모두 검증하고 `ProcessStep`의 `evidencePropertyId` 계약을 그대로 소비해야 합니다.
- 행동 설명은 교육용 단순화와 실제 결과 비보장 경계를 명시했으며 절차 수치(분·초·온도·부피·질량)를 넣지 않았습니다.
