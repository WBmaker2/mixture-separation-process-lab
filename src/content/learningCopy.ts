import type { LabStage } from '../state/contracts';

export interface StageCopy {
  eyebrow: string;
  title: string;
  description: string;
  nextAction: string;
}

export const STAGE_COPY: Readonly<Record<LabStage, StageCopy>> = {
  intake: { eyebrow: '1단계 · 미션 접수', title: '미션과 목표 물질을 골라요', description: '혼합물에서 찾아낼 물질을 정하고, 관찰할 준비를 해요.', nextAction: '미션을 고른 뒤 목표 물질을 선택하세요.' },
  properties: { eyebrow: '2단계 · 성질 분석', title: '물질의 성질을 찾아요', description: '눈으로 확인한 성질에 체크하면 알맞은 행동이 열려요.', nextAction: '필수 성질을 모두 확인하세요.' },
  design: { eyebrow: '3단계 · 공정 설계', title: '분리 순서를 설계해요', description: '방법과 준비 행동을 골라 물질함의 흐름을 연결해요.', nextAction: '다음 단계에 넣을 행동을 고르세요.' },
  simulation: { eyebrow: '4단계 · 가상 실행', title: '결과를 먼저 예측해요', description: '토큰이 어느 물질함으로 갈지 생각한 뒤 가상으로 실행해요.', nextAction: '예상 출력 하나를 고르세요.' },
  quality: { eyebrow: '5단계 · 결과 점검', title: '결과를 보고 물질함을 골라요', description: '토큰의 이동을 따라가며 목표 물질이 남은 곳을 찾아요.', nextAction: '목표 물질마다 물질함을 선택하세요.' },
  revision: { eyebrow: '6단계 · 공정 수정', title: '더 나은 순서로 고쳐요', description: '문제가 생긴 단계를 찾아 성질과 흐름을 근거로 다시 설계해요.', nextAction: '바꿀 단계와 바꾼 이유를 정하세요.' },
  report: { eyebrow: '7단계 · 학습 기록', title: '배운 점을 기록해요', description: '처음 공정과 결과를 돌아보고 생활 속 분리와 연결해요.', nextAction: '배운 점을 확인하고 생각을 한 줄 남겨 보세요.' },
};
