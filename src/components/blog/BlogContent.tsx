import React, { forwardRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import YouTubeEmbed from './YouTubeEmbed';

interface BlogContentProps {
  content: string;
}

const BlogContent = forwardRef<HTMLDivElement, BlogContentProps>(({ content }, ref) => {
  // Extract YouTube video IDs from content
  const [youtubeVideos, setYoutubeVideos] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Extract YouTube video IDs from content
    const extractYoutubeEmbeds = () => {
      const embedRegex = /<div class="video-container">\s*<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)"[^>]*><\/iframe>\s*<\/div>/g;
      const videoIds = new Map<string, string>();
      let match;

      while ((match = embedRegex.exec(content)) !== null) {
        const videoId = match[1];
        const fullMatch = match[0];
        if (videoId) {
          videoIds.set(fullMatch, videoId);
        }
      }

      setYoutubeVideos(videoIds);
    };

    extractYoutubeEmbeds();
  }, [content]);

  // Extract local video URLs from content
  const [localVideos, setLocalVideos] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Extract local video URLs from content
    const extractLocalVideos = () => {
      const localVideoRegex = /<div class="video-container" data-local-video="true" data-video-url="([^"]+)">[\s\S]*?<\/div>/g;
      const videoUrls = new Map<string, string>();
      let match;

      while ((match = localVideoRegex.exec(content)) !== null) {
        const videoUrl = match[1];
        const fullMatch = match[0];
        if (videoUrl) {
          videoUrls.set(fullMatch, videoUrl);
        }
      }

      setLocalVideos(videoUrls);
    };

    extractLocalVideos();
  }, [content]);

  // Process content to replace YouTube embeds and local videos with placeholders
  const processedContent = React.useMemo(() => {
    let processed = content;

    // Replace YouTube embeds
    youtubeVideos.forEach((videoId, fullMatch) => {
      // Replace with a placeholder that our custom renderer will handle
      processed = processed.replace(fullMatch, `<div class="youtube-embed" data-video-id="${videoId}"></div>`);
    });

    // Replace local videos
    localVideos.forEach((videoUrl, fullMatch) => {
      // Replace with a placeholder that our custom renderer will handle
      processed = processed.replace(fullMatch, `<div class="local-video-embed" data-video-url="${videoUrl}"></div>`);
    });

    return processed;
  }, [content, youtubeVideos, localVideos]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Custom rendering for code blocks with syntax highlighting
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom rendering for images
          img({ node, ...props }) {
            return (
              <img
                {...props}
                className="rounded-lg shadow-md my-8 max-w-full h-auto"
                loading="lazy"
              />
            );
          },
          // Custom rendering for links
          a({ node, ...props }) {
            return (
              <a
                {...props}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              />
            );
          },
          // Custom rendering for headings with unique IDs
          h2({ node, ...props }) {
            // Use existing ID if available, otherwise generate one
            const existingId = props.id;
            const text = props.children?.[0]?.toString() || '';
            const id = existingId || `h2-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Math.random().toString(36).substr(2, 5)}`;
            return <h2 id={id} className="scroll-mt-24" {...props} />;
          },
          h3({ node, ...props }) {
            const existingId = props.id;
            const text = props.children?.[0]?.toString() || '';
            const id = existingId || `h3-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Math.random().toString(36).substr(2, 5)}`;
            return <h3 id={id} className="scroll-mt-24" {...props} />;
          },
          h4({ node, ...props }) {
            const existingId = props.id;
            const text = props.children?.[0]?.toString() || '';
            const id = existingId || `h4-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Math.random().toString(36).substr(2, 5)}`;
            return <h4 id={id} className="scroll-mt-24" {...props} />;
          },
          // Custom rendering for blockquotes
          blockquote({ node, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-indigo-500 pl-4 italic text-gray-700 dark:text-gray-300"
                {...props}
              />
            );
          },
          // Custom rendering for YouTube embeds and local videos
          div({ node, className, ...props }) {
            if (className === 'youtube-embed' && props['data-video-id']) {
              const videoId = props['data-video-id'] as string;
              return <YouTubeEmbed videoId={videoId} title="YouTube video" />;
            }
            if (className === 'local-video-embed' && props['data-video-url']) {
              const videoUrl = props['data-video-url'] as string;
              return <YouTubeEmbed videoId="local" title="Video" isLocalVideo={true} localVideoUrl={videoUrl} />;
            }
            return <div className={className} {...props} />;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </motion.div>
  );
});

BlogContent.displayName = 'BlogContent';

export default BlogContent;
