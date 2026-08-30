import type { ReactNode } from 'react';

export type LearningCalloutTone = 'question' | 'hint' | 'success' | 'warning';
export interface LearningCalloutProps { tone: LearningCalloutTone; title: string; children: ReactNode; role?: 'status' | 'note' | 'alert'; }

export function LearningCallout({ tone, title, children, role = tone === 'warning' ? 'alert' : 'note' }: LearningCalloutProps) {
  return <div className={`learning-callout callout-${tone}`} role={role}><strong>{title}</strong><div>{children}</div></div>;
}
