export type TerminalActionKind =
  | 'help'
  | 'doctor'
  | 'status'
  | 'start_flow'
  | 'start_ops'
  | 'open_integrations'
  | 'market_scan'
  | 'role_buyer'
  | 'role_provider'
  | 'role_evaluator'
  | 'clear'
  | 'unknown';

export type TerminalRunRecord = {
  id: string;
  at: string;
  command: string;
  action: TerminalActionKind;
  note: string;
};

const KEY = 'dealrail.terminal.runs';
const EVENT_NAME = 'dealrail:terminal-ledger';

export function listTerminalRuns(): TerminalRunRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TerminalRunRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function pushTerminalRun(record: Omit<TerminalRunRecord, 'id' | 'at'>) {
  if (typeof window === 'undefined') return;
  const runs = listTerminalRuns();
  runs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...record,
  });
  window.localStorage.setItem(KEY, JSON.stringify(runs.slice(0, 200)));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeTerminalRuns(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
