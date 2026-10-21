/** Extract a YouTube video id from the common URL shapes admins paste. */
export function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return parsed.pathname.slice(1) || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
      const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
      return match ? match[2] : null;
    }
  } catch {
    return null;
  }
  return null;
}
