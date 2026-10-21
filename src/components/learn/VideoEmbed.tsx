import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { youTubeId } from '@/lib/youtube';

interface VideoEmbedProps {
  url: string;
  title: string;
}

/**
 * Click-to-load video: shows a lightweight thumbnail and only loads the
 * (privacy-enhanced) YouTube player when the user asks for it. Saves data on
 * mobile networks and keeps third-party scripts off the page by default.
 */
const VideoEmbed = ({ url, title }: VideoEmbedProps) => {
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(url);

  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video items-center justify-center gap-2 bg-muted text-sm font-medium text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        Watch video (opens in a new tab)
      </a>
    );
  }

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg">
          <Play className="ml-1 h-6 w-6" fill="currentColor" aria-hidden="true" />
        </span>
      </span>
      <span className="sr-only">Play video: {title}</span>
    </button>
  );
};

export default VideoEmbed;
