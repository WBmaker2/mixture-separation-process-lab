# Task 1 보고서: 정적 SPA와 테스트 하네스 스캐폴드

## 구현 요약

- Vite + React + TypeScript 정적 SPA의 기본 메타데이터와 실행 스크립트를 구성했습니다.
- `base: './'`를 적용해 로컬 정적 자산 기준의 Vite 빌드를 구성했습니다.
- 한국어 서비스명과 가상 모델 안전 경계를 표시하는 최소 `App` 셸을 구현했습니다.
- Vitest + jsdom + Testing Library 테스트 하네스를 구성했습니다.
- 기존 `.gitignore` 항목을 보존하고 Task 1 생성물과 TypeScript 빌드 캐시를 무시하도록 보완했습니다.

## 파일

- `.gitignore`
- `package.json`, `package-lock.json`
- `index.html`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`, `vitest.config.ts`
- `src/App.tsx`, `src/App.test.tsx`, `src/main.tsx`, `src/vite-env.d.ts`
- `src/test/setup.ts`
- `src/styles/tokens.css`, `src/styles/global.css`

## TDD RED

명령:

```text
npm run test -- src/App.test.tsx
```

결과: 실패. `src/App.test.tsx`에서 예상한 대로 `Error: Cannot find module './App'`가 발생했습니다.

## TDD GREEN

명령:

```text
npm run test -- src/App.test.tsx
```

결과:

```text
Test Files  1 passed (1)
Tests       1 passed (1)
```

## 프로덕션 빌드

명령:

```text
npm run build
```

결과:

```text
vite v8.2.2 building client environment for production...
✓ 17 modules transformed.
dist/index.html                   0.57 kB │ gzip:  0.40 kB
dist/assets/index-BFkZ8sMI.css    0.23 kB │ gzip:  0.20 kB
dist/assets/index-BUgmv3F1.js   190.56 kB │ gzip: 60.14 kB
✓ built in 457ms
```

## 자체 검토

- `strict`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`, 미사용 검사 설정을 적용했습니다.
- 브라우저 진입점은 `#root`이며 `StrictMode`로 렌더링합니다.
- 외부 CDN이나 런타임 외부 자산을 추가하지 않았습니다.
- 각 소스 파일은 500줄 미만입니다.
- `src/vite-env.d.ts`는 TypeScript 7에서 CSS side-effect import를 인식시키기 위해 추가했습니다.

## 우려 사항

- 최초 npm 설치는 사용자 npm 캐시의 root 소유 파일로 `EPERM`이 발생했으나, 작업 전용 임시 npm 캐시로 재시도해 정상 설치했습니다.
- 현재 `App`은 Task 1 범위의 최소 셸이며 실제 학습 흐름과 기능은 후속 Task에서 구현됩니다.

## 수정 라운드 1: lockfile 루트 메타데이터 정합성

리뷰에서 지적된 `package-lock.json`의 루트 `name`/`version`이 `package.json`과 불일치하던 문제를 `npm install --package-lock-only`로 재생성해 수정했습니다. 이제 두 파일 모두 `mixture-separation-process-lab`, `0.1.0`을 사용합니다.

검증 명령과 결과:

```text
npm_config_cache=/private/tmp/mixture-separation-npm-cache npm ci
added 118 packages, and audited 119 packages in 2s
found 0 vulnerabilities

npm run test -- src/App.test.tsx
Test Files  1 passed (1)
Tests       1 passed (1)

npm run build
✓ 17 modules transformed.
dist/index.html                   0.57 kB │ gzip:  0.40 kB
dist/assets/index-BFkZ8sMI.css    0.23 kB │ gzip:  0.20 kB
dist/assets/index-BUgmv3F1.js   190.56 kB │ gzip: 60.14 kB
✓ built in 283ms
```
