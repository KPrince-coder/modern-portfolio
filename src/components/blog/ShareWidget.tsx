import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShare2,
  FiCopy,
  FiTwitter,
  FiLinkedin,
  FiFacebook,
  FiMail,
  FiMessageCircle,
  FiMoreHorizontal
} from 'react-icons/fi';
import { FaReddit, FaPinterest, FaTelegram, FaWhatsapp } from 'react-icons/fa';

interface ShareWidgetProps {
  url: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Comprehensive sharing widget with multiple social platforms and copy link functionality
 */
const ShareWidget: React.FC<ShareWidgetProps> = ({
  url,
  title,
  summary = '',
  imageUrl = '',
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Encode parameters for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);
  const encodedImageUrl = encodeURIComponent(imageUrl);

  // Share URLs for different platforms
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImageUrl}&description=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`,
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share to a platform
  const shareTo = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Main share platforms (always visible)
  const mainPlatforms = [
    { id: 'copy', name: 'Copy Link', icon: FiCopy, action: copyToClipboard },
    { id: 'twitter', name: 'Twitter', icon: FiTwitter, action: () => shareTo('twitter') },
    { id: 'facebook', name: 'Facebook', icon: FiFacebook, action: () => shareTo('facebook') },
    { id: 'linkedin', name: 'LinkedIn', icon: FiLinkedin, action: () => shareTo('linkedin') },
  ];

  // Additional platforms (shown when "More" is clicked)
  const morePlatforms = [
    { id: 'reddit', name: 'Reddit', icon: FaReddit, action: () => shareTo('reddit') },
    { id: 'pinterest', name: 'Pinterest', icon: FaPinterest, action: () => shareTo('pinterest') },
    { id: 'telegram', name: 'Telegram', icon: FaTelegram, action: () => shareTo('telegram') },
    { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, action: () => shareTo('whatsapp') },
    { id: 'email', name: 'Email', icon: FiMail, action: () => shareTo('email') },
  ];

  // Compact mode (just the share button that opens a dropdown)
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Share this post"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls="share-dropdown"
          id="share-button"
          title="Share this post"
        >
          <FiShare2 className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              id="share-dropdown"
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="share-button"
            >
              <div className="p-2 space-y-1">
                {mainPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={platform.action}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <platform.icon className="mr-2 w-4 h-4" />
                    {platform.id === 'copy' && copied ? 'Copied!' : platform.name}
                  </button>
                ))}

                <button
                  onClick={() => setShowMore(!showMore)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <FiMoreHorizontal className="mr-2 w-4 h-4" />
                  {showMore ? 'Less options' : 'More options'}
                </button>

                {showMore && (
                  <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                    {morePlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={platform.action}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <platform.icon className="mr-2 w-4 h-4" />
                        {platform.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full mode (horizontal row of share buttons)
  return (
    <div className={`${className}`}>
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <FiShare2 className="w-5 h-5" />
          Share this post
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Copy link button */}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Copy link"
          >
            <FiCopy className="w-5 h-5" />
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>

          {/* Social share buttons */}
          <button
            onClick={() => shareTo('twitter')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            aria-label="Share on Twitter"
          >
            <FiTwitter className="w-5 h-5" />
            <span className="hidden sm:inline">Twitter</span>
          </button>

          <button
            onClick={() => shareTo('facebook')}
            className="flex items-center gap-2 px-4 py-2 bg-[#4267B2] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            aria-label="Share on Facebook"
          >
            <FiFacebook className="w-5 h-5" />
            <span className="hidden sm:inline">Facebook</span>
          </button>

          <button
            onClick={() => shareTo('linkedin')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            aria-label="Share on LinkedIn"
          >
            <FiLinkedin className="w-5 h-5" />
            <span className="hidden sm:inline">LinkedIn</span>
          </button>

          <button
            onClick={() => shareTo('whatsapp')}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* More options dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-expanded={showMore}
              aria-haspopup="true"
            >
              <FiMoreHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">More</span>
            </button>

            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    {morePlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={platform.action}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <platform.icon className="mr-2 w-4 h-4" />
                        {platform.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWidget;
