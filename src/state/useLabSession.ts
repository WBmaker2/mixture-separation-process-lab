import { useEffect, useReducer } from 'react';
import type { Dispatch } from 'react';
import { createInitialSession, labReducer } from './labReducer';
import { loadSession, saveSession } from './persistence';
import type { LabAction, LabSession } from './contracts';
export function useLabSession(): { state: LabSession; dispatch: Dispatch<LabAction> } {
  const [state, dispatch] = useReducer(labReducer, undefined, () => typeof window === 'undefined' ? createInitialSession() : loadSession(window.localStorage));
  useEffect(() => { if (typeof window !== 'undefined') saveSession(window.localStorage, state); }, [state]);
  return { state, dispatch };
}
