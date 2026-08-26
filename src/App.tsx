import { AppShell } from './components/AppShell';
import { IntakeScreen } from './features/intake/IntakeScreen';
import { PropertyLabScreen } from './features/properties/PropertyLabScreen';
import { useLabSession } from './state/useLabSession';
import { getAttentionActionId } from './state/labReducer';
import { ProcessBoardScreen } from './features/process-board/ProcessBoardScreen';

export function App() {
  const { state, dispatch } = useLabSession();
  const attentionActionId = getAttentionActionId(state);
  const content = state.stage === 'intake'
    ? <IntakeScreen missionId={state.missionId} selectedTargetIds={state.selectedTargetIds} attentionActionId={attentionActionId} dispatch={dispatch} />
    : state.stage === 'properties' && state.missionId
      ? <PropertyLabScreen missionId={state.missionId} confirmedPropertyIds={state.confirmedPropertyIds} attentionActionId={attentionActionId} dispatch={dispatch} />
      : (state.stage === 'design' || state.stage === 'revision') && state.missionId
        ? <ProcessBoardScreen missionId={state.missionId} confirmedPropertyIds={state.confirmedPropertyIds} plan={state.draftPlan} initialPlan={state.initialPlan} planHistoryDepth={state.planHistory.length} attentionActionId={attentionActionId} dispatch={dispatch} />
        : <section className="screen"><h2>현재 단계: {state.stage}</h2><p>이 단계 화면은 다음 학습 작업에서 열립니다. 현재 단계로 돌아가려면 처음부터 다시 시작하세요.</p></section>;
  return <AppShell stage={state.stage} updateHistoryButton={<button type="button" className="update-button">업데이트 내역</button>}>{content}</AppShell>;
}
