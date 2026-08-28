import { useEffect, useState } from 'react';
import { MaterialTokenView } from '../../components/MaterialTokenView';
import { MATERIALS } from '../../domain/materials';
import type { MaterialToken, ProcessOutcome } from '../../simulation/contracts';
import type { MovementPhase } from '../../simulation/movementCopy';

function Scene({ testId, title, tokenIds, tokens }: { testId: string; title: string; tokenIds: readonly string[]; tokens: Readonly<Record<string, MaterialToken>> }) {
  const counts = new Map<string, number>(); tokenIds.forEach((id) => { const material = tokens[id]?.materialId; if (material) counts.set(material, (counts.get(material) ?? 0) + 1); });
  return <section data-testid={testId} className="movement-scene"><h4>{title}</h4><div className="token-list">{[...counts].map(([id, count]) => <MaterialTokenView key={id} materialId={id as keyof typeof MATERIALS} count={count} />)}</div></section>;
}
export interface MovementSceneProps { outcome: ProcessOutcome; beforeTokenIds: readonly string[]; reducedMotion: boolean; phase?: MovementPhase; onPhaseChange?: (phase: MovementPhase) => void; }
export function MovementScene({ outcome, beforeTokenIds, reducedMotion, phase: requestedPhase, onPhaseChange }: MovementSceneProps) {
  const afterTokenIds = outcome.outputs.flatMap((output) => output.stream.tokenIds);
  const evaporation = outcome.actionId === 'virtual-evaporation';
  const staticOnly = reducedMotion || outcome.status === 'no-basis';
  const [phase, setPhase] = useState<MovementPhase>(staticOnly ? 'complete' : 'moving');

  useEffect(() => {
    const initialPhase: MovementPhase = staticOnly ? 'complete' : 'moving';
    setPhase(initialPhase);
    if (initialPhase === 'complete') onPhaseChange?.(initialPhase);
    if (initialPhase === 'complete') return;
    const timer = window.setTimeout(() => { setPhase('complete'); onPhaseChange?.('complete'); }, 700);
    return () => window.clearTimeout(timer);
  }, [outcome.stepId, outcome.status, reducedMotion, staticOnly]);

  const displayPhase: MovementPhase = staticOnly ? 'complete' : requestedPhase ?? phase;
  return <div className="movement-scenes"><Scene testId="before-scene" title="실행 전 물질함" tokenIds={beforeTokenIds} tokens={outcome.tokens} />{displayPhase === 'complete' ? <span className="scene-arrow" aria-label="전 상태에서 후 상태로">→</span> : <div data-testid="moving-token-layer" className="token-travel" aria-label="이동 중인 토큰">토큰이 교육용 모형 칸으로 이동합니다.</div>}<Scene testId="after-scene" title={evaporation ? '실행 후 모형 칸 (물 운반 토큰은 수증기 모형)' : '실행 후 물질함'} tokenIds={afterTokenIds} tokens={outcome.tokens} />{evaporation && <p>화면 속 물 운반 토큰이 수증기 모형 칸으로 이동</p>}</div>;
}
