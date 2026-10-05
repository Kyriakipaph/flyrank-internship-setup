const USER_ID_KEY = 'tierup:userId';

/**
 * Returns a stable per-browser user id, generating a fresh UUID on the first
 * call and storing it in localStorage. Returns null during server-side render
 * or if localStorage is unavailable (private windows, blocked cookies).
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let id = window.localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
