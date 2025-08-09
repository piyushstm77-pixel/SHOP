export const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'gadgets', name: 'Cyber Gadgets' },
  { id: 'wearables', name: 'Neural Wearables' },
  { id: 'interfaces', name: 'AR Interfaces' },
];

export const SESSION_ID_KEY = 'neomarket_session_id';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}
