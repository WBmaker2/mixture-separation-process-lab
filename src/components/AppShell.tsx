import type { ReactNode } from 'react';
import type { LabStage } from '../state/contracts';

export interface AppShellProps {
  stage: LabStage;
  children: ReactNode;
  updateHistoryButton: ReactNode;
}

const stages: readonly [LabStage, string][] = [
  ['intake', '미션 접수'], ['properties', '성질 분석'], ['design', '공정 설계'],
  ['simulation', '가상 실행'], ['quality', '결과 점검'], ['revision', '공정 수정'], ['report', '학습 기록'],
];

export function AppShell({ stage, children, updateHistoryButton }: AppShellProps) {
  const currentIndex = stages.findIndex(([id]) => id === stage);
  return <div className="app-shell">
    <header className="app-header"><div><p className="eyebrow">가상 공정 탐험</p><h1>혼합물 분리 공정 설계소</h1></div><div className="update-slot">{updateHistoryButton}</div></header>
    <nav aria-label="학습 단계" className="stage-nav">
      {stages.map(([id, label], index) => <span key={id} className={id === stage ? 'stage-current' : index < currentIndex ? 'stage-done' : 'stage-locked'} aria-current={id === stage ? 'step' : undefined}>{index + 1}. {label}{index > currentIndex ? ' (아직 열리지 않음)' : ''}</span>)}
    </nav>
    <main id="main-content">{children}</main>
  </div>;
}
