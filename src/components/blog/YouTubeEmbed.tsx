import React, { useState } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title = 'YouTube video' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate the thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  // Handle click to load the actual iframe
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
            <img 
              src={thumbnailUrl} 
              alt={`Thumbnail for ${title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
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
              <p>Click to load video from YouTube. Loading the video will allow YouTube to set cookies.</p>
            </div>
          </div>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        ></iframe>
      )}
    </div>
  );
};

export default YouTubeEmbed;
