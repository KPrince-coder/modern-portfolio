import { useEffect, useRef } from 'react';
import { useTrackBlogTimeSpent } from '../hooks/useSupabase';

/**
 * Tracks the time spent on a blog post and reports it when the component unmounts
 * @param postId The ID of the blog post
 * @param isEnabled Whether tracking is enabled
 */
export const useTrackBlogReadTime = (postId: string, isEnabled: boolean = true) => {
  const trackTimeSpent = useTrackBlogTimeSpent();
  const startTimeRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isEnabled || !postId) return;

    // Reset start time when the component mounts
    startTimeRef.current = Date.now();
    totalTimeRef.current = 0;

    // Set up an interval to periodically update the total time
    // This helps in case the user leaves the tab open but isn't actively reading
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSpent = now - startTimeRef.current;
      
      // Only count time if it's reasonable (less than 30 seconds since last check)
      // This helps filter out cases where the user left the tab open
      if (timeSpent < 30000) {
        totalTimeRef.current += timeSpent;
      }
      
      // Reset the start time
      startTimeRef.current = now;
    }, 5000); // Check every 5 seconds

    // Clean up when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Calculate final time spent
      const finalTimeSpent = totalTimeRef.current + (Date.now() - startTimeRef.current);
      
      // Convert to seconds and track if it's a reasonable amount of time
      const timeSpentSeconds = Math.round(finalTimeSpent / 1000);
      if (timeSpentSeconds > 5 && timeSpentSeconds < 3600) {
        trackTimeSpent.mutate({
          postId,
          timeSpentSeconds,
        });
      }
    };
  }, [postId, isEnabled, trackTimeSpent]);
};

/**
 * Utility to generate structured data for a blog post (JSON-LD)
 * @param post The blog post
 * @param url The URL of the blog post
 * @returns JSON-LD structured data as a string
 */
export const generateBlogStructuredData = (post: any, url: string): string => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.summary,
    'image': post.featured_image_url,
    'datePublished': post.published_at,
    'dateModified': post.updated_at,
    'author': {
      '@type': 'Person',
      'name': 'Portfolio Owner'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Modern Portfolio',
      'logo': {
        '@type': 'ImageObject',
        'url': `${window.location.origin}/logo.png`
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    }
  };

  return JSON.stringify(structuredData);
};
