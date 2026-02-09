// Simple event emitter to bridge the axios interceptor with the React auth context.
// The interceptor cannot access React state directly, so we use an event pattern.

type Listener = () => void;

const listeners: Set<Listener> = new Set();

/** Subscribe to forced-logout events (called from RootLayout). */
export function onForceLogout(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Emit a forced-logout event (called from the axios 401 interceptor). */
export function emitForceLogout(): void {
  listeners.forEach((fn) => fn());
}

