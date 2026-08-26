import type { ButtonHTMLAttributes } from 'react';

export interface PrimaryActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  attention: boolean;
}

export function PrimaryAction({ attention, className = '', ...props }: PrimaryActionProps) {
  const classes = [className, attention ? 'gi-pulse' : ''].filter(Boolean).join(' ');
  return <button {...props} className={classes} {...(attention ? { 'data-attention': 'true' } : {})} />;
}
