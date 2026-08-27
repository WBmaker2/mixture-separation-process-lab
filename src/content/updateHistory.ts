export interface UpdateHistoryEntry { date: `${number}-${number}-${number}`; category: '설계' | '개발' | '개선' | '검수'; summary: string; }
export const UPDATE_HISTORY: readonly UpdateHistoryEntry[] = [
  { date: '2026-08-26', category: '설계', summary: '최초 설계 문서 작성' },
  { date: '2026-08-26', category: '개발', summary: 'MVP 구현 및 과학·안전 문구 검수' },
];
