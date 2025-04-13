import React, { useState, useEffect } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  isLocalVideo?: boolean;
  localVideoUrl?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = 'Video',
  isLocalVideo = false,
  localVideoUrl = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [error, setError] = useState(false);

  // Generate the thumbnail URL for YouTube videos
  useEffect(() => {
    if (isLocalVideo) {
      // For local videos, we don't need to fetch a thumbnail
      return;
    }

    // Use a static thumbnail URL without loading the image first
    // This prevents tracking prevention issues
    setThumbnailUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
  }, [videoId, isLocalVideo]);

  // Handle click to load the actual video
  const handleLoadVideo = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6">
      {!isLoaded ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer group"
          onClick={handleLoadVideo}
          role="button"
          aria-label={`Load ${title}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleLoadVideo();
            }
          }}
        >
          <div className="relative w-full h-full">
            {/* Thumbnail image */}
            {isLocalVideo ? (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`Thumbnail for ${title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="animate-pulse w-full h-full bg-gray-700"></div>
                </div>
              )
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-sm">
              {isLocalVideo ? (
                <p>Click to play video</p>
              ) : (
                <p>Click to load video from YouTube. This will connect to YouTube's servers and may allow tracking.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        isLocalVideo ? (
          <video
            src={localVideoUrl}
            controls
            autoPlay
            className="absolute top-0 left-0 w-full h-full border-0"
            onError={() => setError(true)}
          >
            {error && <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4">Error loading video</div>}
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="youtube-embed-container">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
              referrerPolicy="no-referrer"
            ></iframe>
          </div>
        )
      )}
    </div>
  );
};

export default YouTubeEmbed;
