export default function VideoCard({ video }) {
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  };

  const thumbnail = video.thumbnail || getYouTubeThumbnail(video.youtubeUrl);

  return (
    <a
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-gradient-to-br from-white to-specimen-bg border border-graph-grid rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-graph-grid/30 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-lab-teal/10">
            <svg className="w-16 h-16 text-lab-teal/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <div className="p-6">
        <h3 className="font-display font-bold text-xl text-chalkboard mb-2 group-hover:text-lab-teal transition-colors line-clamp-2">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-chalkboard-light text-sm mb-4 line-clamp-2">
            {video.description}
          </p>
        )}
        
        {video.duration && (
          <div className="inline-flex items-center px-2 py-1 bg-graph-grid/20 rounded-sm font-mono-smallcaps text-chalkboard-light text-xs">
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
