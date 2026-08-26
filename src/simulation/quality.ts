import type { MaterialId, PropertyId, RecoveryClaim } from '../domain/contracts';
import type { QualitySummary, RunEvaluation, SimulationRun, TargetQuality, PlanIssueCode } from './contracts';

export function computeQuality(run: SimulationRun, claims: readonly RecoveryClaim[], targetIds: readonly MaterialId[]): QualitySummary {
  const byTarget: Partial<Record<MaterialId, TargetQuality>> = {}; let totalMixedInCount = 0;
  const lost = new Set(run.lostTokenIds);
  for (const materialId of targetIds) {
    const initialCount = Object.values(run.tokens).filter((token) => token.materialId === materialId && token.origin === 'initial').length;
    const claim = claims.find((item) => item.materialId === materialId);
    const stream = claim ? run.streams[claim.streamId] : undefined;
    const validClaim = Boolean(claim && stream);
    const claimedIds = new Set(validClaim ? stream?.tokenIds ?? [] : []);
    const recoveredCount = [...claimedIds].filter((id) => run.tokens[id]?.materialId === materialId).length;
    const mixedInCount = [...claimedIds].filter((id) => run.tokens[id]?.materialId !== materialId).length;
    const lostCount = [...lost].filter((id) => run.tokens[id]?.materialId === materialId).length;
    const unrecoveredCount = run.activeLeafStreamIds.reduce((sum, id) => id === (validClaim ? claim?.streamId : null) ? sum : sum + (run.streams[id]?.tokenIds ?? []).filter((tokenId) => run.tokens[tokenId]?.materialId === materialId).length, 0);
    const recoveredBand = recoveredCount >= Math.ceil(initialCount * 0.8) ? 'mostly' : recoveredCount > 0 ? 'some' : 'almost-none';
    byTarget[materialId] = { materialId, initialCount, recoveredCount, recoveredBand, mixedInCount, unrecoveredCount, lostCount, claimedStreamId: validClaim ? claim?.streamId ?? null : null };
    totalMixedInCount += mixedInCount;
  }
  return { byTarget, totalMixedInCount, totalLostCount: run.lostTokenIds.length };
}

export function evaluateRun(run: SimulationRun, quality: QualitySummary, confirmedPropertyIds: readonly PropertyId[]): RunEvaluation {
  const codes: (PlanIssueCode | 'missing-claim' | 'almost-no-recovery' | 'too-much-contamination' | 'no-basis-step' | 'missing-required-property')[] = run.planIssues.map((i) => i.code);
  run.outcomes.filter((outcome) => outcome.status === 'no-basis').forEach(() => { if (!codes.includes('no-basis-step')) codes.push('no-basis-step'); });
  for (const target of Object.values(quality.byTarget)) {
    if (!target) continue;
    if (!target.claimedStreamId) codes.push('missing-claim');
    if (target.recoveredBand === 'almost-none') codes.push('almost-no-recovery');
    if (target.mixedInCount > 1) codes.push('too-much-contamination');
  }
  // The required property list is attached to the run only through its mission id; missions are canonical here.
  const requiredByMission: Record<string, readonly PropertyId[]> = { 'size-sort': ['particle-size'], 'liquid-layers': ['immiscibility'], 'salt-recovery': ['water-solubility', 'filter-behavior', 'evaporation-residue'], 'integrated-process': ['particle-size', 'water-solubility', 'filter-behavior', 'evaporation-residue'] };
  for (const propertyId of requiredByMission[run.missionId] ?? []) if (!confirmedPropertyIds.includes(propertyId)) codes.push('missing-required-property');
  return { accepted: codes.length === 0, issueCodes: [...new Set(codes)], firstProblemStepId: run.planIssues[0]?.stepId ?? run.outcomes.find((o) => o.status === 'no-basis')?.stepId ?? null };
}
