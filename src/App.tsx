import { useMemo } from 'react';
import { AppShell } from './components/AppShell';
import { IntakeScreen } from './features/intake/IntakeScreen';
import { PropertyLabScreen } from './features/properties/PropertyLabScreen';
import { useLabSession } from './state/useLabSession';
import { getAttentionActionId } from './state/labReducer';
import { ProcessBoardScreen } from './features/process-board/ProcessBoardScreen';
import { SimulationScreen } from './features/simulation/SimulationScreen';
import { useReducedMotion } from './hooks/useReducedMotion';
import { getMission } from './domain/missions';
import { runProcess } from './simulation/runProcess';
import { QualityScreen } from './features/quality/QualityScreen';

export function App() {
  const { state, dispatch } = useLabSession();
  const attentionActionId = getAttentionActionId(state);
  const mission = state.missionId ? getMission(state.missionId) : null;
  const fullRun = useMemo(() => mission ? runProcess(mission, state.draftPlan) : null, [mission, state.draftPlan]);
  const reducedMotion = useReducedMotion();
  const content = state.stage === 'intake'
    ? <IntakeScreen missionId={state.missionId} selectedTargetIds={state.selectedTargetIds} attentionActionId={attentionActionId} dispatch={dispatch} />
    : state.stage === 'properties' && state.missionId
      ? <PropertyLabScreen missionId={state.missionId} confirmedPropertyIds={state.confirmedPropertyIds} attentionActionId={attentionActionId} dispatch={dispatch} />
      : state.stage === 'simulation' && mission && fullRun
        ? <SimulationScreen mission={mission} plan={state.draftPlan} fullRun={fullRun} completedStepIds={state.completedStepIds} predictions={state.predictions} attentionActionId={attentionActionId} reducedMotion={reducedMotion} dispatch={dispatch} />
      : (state.stage === 'design' || state.stage === 'revision') && state.missionId
        ? <ProcessBoardScreen missionId={state.missionId} confirmedPropertyIds={state.confirmedPropertyIds} plan={state.draftPlan} initialPlan={state.initialPlan} revisionReason={state.revisionReason} showRevisionReason={state.stage === 'revision'} planHistoryDepth={state.planHistory.length} attentionActionId={attentionActionId} dispatch={dispatch} />
      : state.stage === 'quality' && mission && state.currentRun
        ? <QualityScreen mission={mission} run={state.currentRun} attempt={state.attempt} confirmedPropertyIds={state.confirmedPropertyIds} selectedTargetIds={state.selectedTargetIds} claims={state.recoveryClaims} attentionActionId={attentionActionId} dispatch={dispatch} />
      : state.stage === 'quality'
        ? <section className="screen" role="alert"><h2>가상 실행 결과가 없습니다</h2><p>품질 검사는 완료된 가상 실행 뒤에 열립니다. 가상 실행 단계로 돌아가 주세요.</p></section>
        : <section className="screen"><h2>현재 단계: {state.stage}</h2><p>이 단계 화면은 다음 학습 작업에서 열립니다. 현재 단계로 돌아가려면 처음부터 다시 시작하세요.</p></section>;
  return <AppShell stage={state.stage} updateHistoryButton={<button type="button" className="update-button">업데이트 내역</button>}>{content}</AppShell>;
}
