import type { GameEvent } from '../engine/types';
import { supabase } from '../backend/supabaseClient';

export const PENDING_SUBMIT_KEY = 'rygo:pending-submit';
const QUEUE_CAP = 50;

export interface SubmitPayload {
  day: string;
  grid_size: 4 | 5 | 6 | 8;
  eventLog: GameEvent[];
  moveCount: number;
  elapsedMs: number;
}

function entryKey(e: SubmitPayload): string {
  return `${e.day}:${e.grid_size}`;
}

function loadQueue(): SubmitPayload[] {
  try {
    const raw = localStorage.getItem(PENDING_SUBMIT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SubmitPayload[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SubmitPayload[]): void {
  try {
    localStorage.setItem(PENDING_SUBMIT_KEY, JSON.stringify(queue));
  } catch {
    // silent on storage errors (quota exceeded, private browsing)
  }
}

function enqueue(payload: SubmitPayload): void {
  const queue = loadQueue();
  const key = entryKey(payload);
  const idx = queue.findIndex(e => entryKey(e) === key);
  if (idx >= 0) {
    queue[idx] = payload;
  } else {
    queue.push(payload);
    while (queue.length > QUEUE_CAP) queue.shift();
  }
  saveQueue(queue);
}

function dequeue(key: string): void {
  saveQueue(loadQueue().filter(e => entryKey(e) !== key));
}

async function getToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

function getSubmitUrl(): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  return base ? `${base}/functions/v1/submit-score` : null;
}

async function sendOne(entry: SubmitPayload): Promise<'terminal' | 'retryable'> {
  const url = getSubmitUrl();
  if (!url) return 'retryable';

  const token = await getToken();
  if (!token) return 'retryable';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        grid_size: entry.grid_size,
        day: entry.day,
        eventLog: entry.eventLog,
        moveCount: entry.moveCount,
        elapsedMs: entry.elapsedMs,
      }),
    });

    if (res.status >= 500) return 'retryable';
    if (res.status >= 400) return 'terminal';
    // 200 { accepted: true } or { accepted: false } — both terminal
    return 'terminal';
  } catch {
    return 'retryable';
  }
}

let flushing = false;

async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    for (const entry of loadQueue()) {
      const outcome = await sendOne(entry);
      if (outcome === 'terminal') dequeue(entryKey(entry));
    }
  } finally {
    flushing = false;
  }
}

if (typeof window !== 'undefined') {
  void flushQueue();
  window.addEventListener('online', () => { void flushQueue(); });
}

export async function enqueueAndSubmit(payload: SubmitPayload): Promise<void> {
  enqueue(payload);
  await flushQueue();
}
