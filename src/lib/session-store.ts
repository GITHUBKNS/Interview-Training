import { SessionData } from './types';

const sessions = new Map<string, SessionData>();

const MAX_SESSIONS = 100;
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function cleanupExpired() {
  const now = Date.now();
  sessions.forEach((session, id) => {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  });
}

export function getSession(id: string): SessionData | undefined {
  cleanupExpired();
  return sessions.get(id);
}

export function setSession(session: SessionData): void {
  cleanupExpired();
  if (sessions.size >= MAX_SESSIONS && !sessions.has(session.id)) {
    let oldestId: string | null = null;
    let oldestTime = Infinity;
    sessions.forEach((s, id) => {
      if (s.createdAt < oldestTime) {
        oldestTime = s.createdAt;
        oldestId = id;
      }
    });
    if (oldestId) sessions.delete(oldestId);
  }
  sessions.set(session.id, session);
}

export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}

export function exportSession(id: string): SessionData | null {
  const session = sessions.get(id);
  return session ? { ...session } : null;
}
