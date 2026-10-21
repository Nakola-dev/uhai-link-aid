/**
 * Earlier service-worker builds cached every Supabase REST and Storage response,
 * which could leave medical data in Cache Storage after sign-out. Current builds
 * only cache public content, but caches created by older builds persist until
 * deleted, so they are purged on startup and on every sign-out.
 */
const SENSITIVE_CACHE_NAMES = ['supabase-api-cache', 'supabase-storage-cache'];

export async function purgeSensitiveCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    await Promise.all(SENSITIVE_CACHE_NAMES.map((name) => caches.delete(name)));
  } catch {
    // Cache Storage can be unavailable (private mode, blocked storage) — nothing to purge.
  }
}
