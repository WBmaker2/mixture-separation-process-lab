import type { LabStage } from '../state/contracts';

export interface LearningProgressProps { stage: LabStage; }

const stages: readonly [LabStage, string][] = [
  ['intake', '미션 접수'], ['properties', '성질 분석'], ['design', '공정 설계'],
  ['simulation', '가상 실행'], ['quality', '결과 점검'], ['revision', '공정 수정'], ['report', '학습 기록'],
];

export function LearningProgress({ stage }: LearningProgressProps) {
  const currentIndex = stages.findIndex(([id]) => id === stage);
  return <nav aria-label="학습 단계" className="learning-progress">
    <p className="progress-label">학습 여정</p>
    <ol>{stages.map(([id, label], index) => {
      const current = id === stage;
      const complete = index < currentIndex;
      const state = current ? 'current' : complete ? 'complete' : 'locked';
      return <li key={id} data-state={state} aria-current={current ? 'step' : undefined}>
        <span className="progress-number" aria-hidden="true">{complete ? '✓' : index + 1}</span>
        <span><strong>{label}</strong><small>{current ? '지금 할 일' : complete ? '완료' : '아직 열리지 않음'}</small></span>
      </li>;
    })}</ol>
  </nav>;
}
