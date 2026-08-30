import { useEffect, useRef, type ReactNode } from 'react';
import type { LabStage } from '../state/contracts';
import { UpdateHistoryDialog } from './UpdateHistoryDialog';
import { LearningProgress } from './LearningProgress';
import { STAGE_COPY } from '../content/learningCopy';

export interface AppShellProps {
  stage: LabStage;
  children: ReactNode;
}

export function AppShell({ stage, children }: AppShellProps) {
  const mainRef = useRef<HTMLElement | null>(null);
  const previousStage = useRef(stage);
  useEffect(() => {
    if (previousStage.current !== stage) mainRef.current?.focus();
    previousStage.current = stage;
  }, [stage]);
  return <div className="app-shell shell-layout">
    <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
    <header className="app-header"><div><p className="eyebrow">가상 공정 탐험</p><h1>혼합물 분리 공정 설계소</h1></div></header>
    <LearningProgress stage={stage} />
    <p className="shell-next-action"><strong>지금 할 일</strong> · {STAGE_COPY[stage].nextAction}</p>
    <main ref={mainRef} id="main-content" tabIndex={-1}>{children}</main>
    <footer className="app-footer"><UpdateHistoryDialog /></footer>
  </div>;
}
