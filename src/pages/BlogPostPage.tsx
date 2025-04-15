import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPostBySlug, useBlogPosts } from '../hooks/useSupabase';
import { useTrackBlogReadTime } from '../utils/blogAnalytics';
import BlogLayout from '../layouts/BlogLayout';
import BlogContent from '../components/blog/BlogContent';
import MetadataManager from '../components/blog/MetadataManager';
import { format } from 'date-fns';
import BlogPostSkeleton from '../components/blog/BlogPostSkeleton';

// Type for adjacent posts
interface AdjacentPost {
  id: string;
  slug: string;
  title: string;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [prevPost, setPrevPost] = useState<AdjacentPost | null>(null);
  const [nextPost, setNextPost] = useState<AdjacentPost | null>(null);
  const [readTime, setReadTime] = useState<string>('');

  // Fetch the blog post
  const { data: post, isLoading, error } = useBlogPostBySlug(slug ?? '');

  // Scroll to top when the page loads or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    console.log('BlogPostPage: Scrolled to top on mount/update');
  }, [slug]);

  // Fetch all posts to determine previous and next posts
  const { data: allPostsData } = useBlogPosts({
    limit: 100, // Fetch enough posts to find adjacent ones
    orderBy: 'published_at',
    orderDirection: 'desc',
  });

  // Track time spent reading
  useTrackBlogReadTime(post?.id ?? '', !!post);

  // Calculate read time
  useEffect(() => {
    if (post?.content) {
      // Estimate read time based on word count (average reading speed: 200 words per minute)
      const wordCount = post.content.trim().split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      setReadTime(`${minutes} min`);
    }
  }, [post?.content]);

  // Set up adjacent posts
  useEffect(() => {
    if (allPostsData?.posts && post) {
      const allPosts = allPostsData.posts;
      const currentIndex = allPosts.findIndex(p => p.slug === post.slug);

      if (currentIndex > 0) {
        const prev = allPosts[currentIndex - 1];
        setPrevPost({
          id: prev.id,
          title: prev.title,
          slug: prev.slug,
        });
      } else {
        setPrevPost(null);
      }

      if (currentIndex < allPosts.length - 1) {
        const next = allPosts[currentIndex + 1];
        setNextPost({
          id: next.id,
          title: next.title,
          slug: next.slug,
        });
      } else {
        setNextPost(null);
      }
    }
  }, [allPostsData, post]);

  // Note: Read time tracking is handled by the useTrackBlogReadTime hook above

  // Format the date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  // Current URL for sharing
  const currentUrl = window.location.href;

  if (isLoading) {
    return <BlogPostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/blog"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <BlogLayout
      title={post.title}
      author={'Admin'}
      date={formatDate(post.published_at)}
      readTime={readTime}
      coverImage={post.featured_image_url}
      slug={post.slug}
      summary={post.summary}
      tags={post.tags}
      category={post.category}
      postId={post.id}
      prevPost={prevPost}
      nextPost={nextPost}
    >
      {/* SEO and Social Sharing Metadata */}
      <MetadataManager
        title={post.title}
        description={post.summary || `Read ${post.title}`}
        url={currentUrl}
        imageUrl={post.featured_image_url}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        author={post.author?.name || 'Admin'}
        tags={post.tags?.map(tag => tag.name) || []}
        type="article"
        readingTime={readTime}
        category={post.category?.name}
      />

      {/* Blog content */}
      <BlogContent ref={contentRef} content={post.content} />
    </BlogLayout>
  );
};

export default BlogPostPage;
