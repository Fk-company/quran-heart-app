// Simple in-memory cache so navigating back to a page shows data instantly,
// without flashing skeleton loaders. Survives client-side route changes only.
const store = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  store.set(key, value);
}

export function hasCached(key: string): boolean {
  return store.has(key);
}
