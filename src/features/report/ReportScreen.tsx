import type { MaterialId, MissionDefinition, ProcessStep } from '../../domain/contracts';
import type { QualitySummary } from '../../simulation/contracts';
import { MATERIALS } from '../../domain/materials';
import { PROPERTIES } from '../../domain/properties';
import { QualityLedger } from '../quality/QualityLedger';
import { ProcessComparison } from './ProcessComparison';
import { StageHeader } from '../../components/StageHeader';
import { LearningCallout } from '../../components/LearningCallout';
import { PrimaryAction } from '../../components/PrimaryAction';
import { STAGE_COPY } from '../../content/learningCopy';
export interface ReportScreenProps { mission: MissionDefinition; selectedTargetIds: readonly MaterialId[]; initialPlan: readonly ProcessStep[] | null; revisedPlan: readonly ProcessStep[] | null; revisionReason: string; sustainabilityReflection: string; quality: QualitySummary | null; onSustainabilityChange: (value: string) => void; onPrint: () => void; onReset: () => void; }
export function ReportScreen({ mission, selectedTargetIds, initialPlan, revisedPlan, revisionReason, sustainabilityReflection, quality, onSustainabilityChange, onPrint, onReset }: ReportScreenProps) {
  const reset = () => { if (window.confirm('현재 기기에 저장된 이 미션 진행을 처음으로 돌립니다.')) onReset(); };
  const needsComparison = mission.id === 'integrated-process' && (!initialPlan?.length || !revisedPlan?.length);
  const heading = needsComparison ? `${mission.title} 보고서 준비 중` : `${mission.title} 완료 보고서`;
  const completedSteps = revisedPlan ?? initialPlan ?? [];
  const learnedProperties = [...new Set(completedSteps.map((step) => PROPERTIES[step.evidencePropertyId].name))];
  const recoveredTokens = quality
    ? selectedTargetIds.reduce((total, id) => total + (quality.byTarget[id]?.recoveredCount ?? 0), 0)
    : null;
  return <article className="screen report-screen" data-testid={needsComparison ? undefined : 'mission-complete'} aria-labelledby="stage-title">
    <StageHeader eyebrow={STAGE_COPY.report.eyebrow} title={heading} description={STAGE_COPY.report.description} /><LearningCallout tone="success" title="여기까지 잘 왔어요" role={needsComparison ? 'note' : 'status'}><p>{STAGE_COPY.report.nextAction}</p></LearningCallout>
    {needsComparison ? <p role="status">공정 비교 자료를 준비하고 있습니다.</p> : <>
      <p>{mission.challenge}</p><h3>회수 목표</h3><ul>{selectedTargetIds.map((id) => <li key={id}>{MATERIALS[id].name}</li>)}</ul>
      <ProcessComparison initialPlan={initialPlan ?? []} revisedPlan={revisedPlan}/>
      {revisionReason.trim() && <section><h3>{revisedPlan ? '수정·완료 근거' : '완료 근거'}</h3><p>{revisionReason}</p></section>}
      <section className="completion-summary" aria-labelledby="completion-summary-title">
        <h3 id="completion-summary-title">이번에 배운 점</h3>
        <p>{learnedProperties.length > 0
          ? `${learnedProperties.join(', ')} 성질을 이용해 물질을 나누고, ${recoveredTokens === null ? '각 토큰의 이동을 따라가며' : `목표 토큰 ${recoveredTokens}개를 확인하며`} 회수 결과를 살펴보았습니다.`
          : '공정에서 물질의 성질과 토큰의 이동을 따라가며 회수 결과를 살펴보았습니다.'}</p>
        <p><strong>다음에는 교사 지도 아래</strong> 실제 재료를 사용할 때 필요한 안전 약속과 도구를 함께 확인해 보세요.</p>
      </section>
      <label className="reflection-field" htmlFor="sustainability-reflection">생활 속 분리 기술과 지속가능한 생활에 이 공정이 어떻게 이어질까요?</label><textarea id="sustainability-reflection" value={sustainabilityReflection} onChange={(e) => onSustainabilityChange(e.target.value)} />
      {quality && <QualityLedger summary={quality} targetIds={selectedTargetIds}/>}<aside className="virtual-model-notice"><strong>이 보고서는 실제 실험 측정 결과가 아닌 가상 교육 모델의 기록입니다.</strong><p>실제 실험 결과는 재료·양·기구에 따라 달라질 수 있습니다.</p></aside><div className="report-actions"><PrimaryAction attention type="button" onClick={onPrint}>설계 보고서 인쇄</PrimaryAction><button type="button" onClick={reset}>다른 미션 시작</button></div>
    </>}</article>;
}
