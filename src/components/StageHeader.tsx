import type { ReactNode } from 'react';

export interface StageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function StageHeader({ eyebrow, title, description, children }: StageHeaderProps) {
  return <header className="stage-header">
    <div><p className="eyebrow">{eyebrow}</p><h2 id="stage-title">{title}</h2><p>{description}</p></div>
    {children && <div className="stage-header-detail">{children}</div>}
  </header>;
}
