import { SAFETY_COPY } from '../content/safety';
export function SafetyNotice() { return <aside className="safety-notice"><strong>안전·가상 모델 안내</strong><p>{SAFETY_COPY.teacherGuidance}</p><p>{SAFETY_COPY.measurementBoundary}.</p></aside>; }
