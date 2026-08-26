export interface SafetyCopy { measurementBoundary: string; teacherGuidance: string; modelLimit: string; variationBoundary: string; classroomBoundary: string; }
export const SAFETY_COPY: SafetyCopy = {
  measurementBoundary: '가상 실험이며 실제 물질의 양·온도·시간을 측정하지 않습니다',
  teacherGuidance: '실제 가열·혼합 실험은 반드시 교사의 안전 지도 아래 별도 절차로 진행합니다.',
  modelLimit: '화면 결과는 교육용 토큰이며 실제 순도나 수율을 보장하지 않습니다.',
  variationBoundary: '실제 실험 결과는 재료·양·기구에 따라 달라질 수 있습니다.',
  classroomBoundary: '이 활동에서는 화면에 제시된 가상 재료와 토큰만 살펴봅니다.',
};
