export interface UpdateHistoryEntry { date: `${number}-${number}-${number}`; category: '설계' | '개발' | '개선' | '검수'; summary: string; }
export const UPDATE_HISTORY: readonly UpdateHistoryEntry[] = [
  { date: '2026-08-29', category: '개선', summary: '학습 단계 위계·모바일 조작·다음 행동 안내를 리디자인' },
  { date: '2026-08-28', category: '개선', summary: '초등학생 검수에 맞춰 예측 판정·모바일 표·버튼 안정성 개선' },
  { date: '2026-08-27', category: '검수', summary: '4개 미션 전체 흐름과 개인정보·안전 점검' },
  { date: '2026-08-27', category: '개발', summary: 'GitHub Pages 자동 배포 흐름 추가' },
  { date: '2026-08-27', category: '개선', summary: '보고서 모바일 여백·공정 유형·인쇄 강조 보완' },
  { date: '2026-08-26', category: '개선', summary: '375px 모바일·키보드·화면 읽기·모션 감소 검수' },
  { date: '2026-08-26', category: '설계', summary: '최초 설계 문서 작성' },
  { date: '2026-08-26', category: '개발', summary: 'MVP 구현 및 과학·안전 문구 검수' },
];
