import { createInitialSession } from './labReducer';
import type { LabSession } from './contracts';
import { validSessionShape } from './sessionValidation';
import { cloneSession } from './sessionSanitizers';
export const STORAGE_KEY = 'mixture-separation-process-lab:v1';
export function serializeSession(s: LabSession): string { return JSON.stringify(cloneSession(s)); }
function valid(x: any): x is LabSession { return validSessionShape(x); }
export function loadSession(storage: Pick<Storage, 'getItem'>): LabSession { try { const raw = storage.getItem(STORAGE_KEY); if (!raw) return createInitialSession(); const x = JSON.parse(raw); return valid(x) ? cloneSession(x) : createInitialSession(); } catch { return createInitialSession(); } }
export function saveSession(storage: Pick<Storage, 'setItem'>, state: LabSession): void { storage.setItem(STORAGE_KEY, serializeSession(state)); }
