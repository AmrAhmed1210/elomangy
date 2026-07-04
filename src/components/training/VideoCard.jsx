import { useMemo, useState } from "react";

// Quality chain from best to worst. maxresdefault doesn't exist for every video,
// so we fall back down the chain on error instead of showing YouTube's ugly
// gray placeholder image.
const THUMBNAIL_QUALITIES = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/
  );
  return match ? match[1] : null;
}

export default function VideoCard({ video }) {
  const sourceUrl = video.youtube_url || video.youtubeUrl || video.url;
  const videoId = useMemo(() => extractYouTubeId(sourceUrl), [sourceUrl]);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const thumbnail =
    video.thumbnail ||
    (videoId && qualityIndex < THUMBNAIL_QUALITIES.length
      ? `https://img.youtube.com/vi/${videoId}/${THUMBNAIL_QUALITIES[qualityIndex]}.jpg`
      : null);

  function handleThumbnailError() {
    // maxresdefault/sddefault return a tiny 120x90 placeholder instead of a
    // real 404, so step down the quality chain until one actually loads.
    if (qualityIndex < THUMBNAIL_QUALITIES.length - 1) {
      setQualityIndex((i) => i + 1);
    } else {
      setImageFailed(true);
    }
  }

  function handleThumbnailLoad(event) {
    // Guard against YouTube's placeholder image, which is served with a
    // 200 status but is always exactly 120x90.
    const { naturalWidth, naturalHeight } = event.target;
    if (naturalWidth === 120 && naturalHeight === 90) {
      handleThumbnailError();
    }
  }

  const showImage = thumbnail && !imageFailed;

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus-visible:ring-4 focus-visible:ring-lab-teal/20"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-lab-teal/10 to-answer-green/10">
        {showImage ? (
          <img
            key={thumbnail}
            src={thumbnail}
            alt={video.title}
            onError={handleThumbnailError}
            onLoad={handleThumbnailLoad}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-lab-teal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-lab-teal ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-xl text-chalkboard mb-2 group-hover:text-lab-teal transition-colors line-clamp-2">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-chalkboard-light text-sm mb-4 line-clamp-2">
            {video.description}
          </p>
        )}

        {video.duration && (
          <div className="inline-flex items-center rounded-full bg-graph-grid/20 px-2.5 py-1 text-xs font-semibold text-chalkboard-light">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {video.duration}
          </div>
        )}
      </div>
    </a>
  );
}