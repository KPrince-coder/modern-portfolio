import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPostBySlug, useBlogPosts } from '../hooks/useSupabase';
import { useTrackBlogReadTime } from '../utils/blogAnalytics';
import { Helmet } from 'react-helmet-async';
import BlogLayout from '../layouts/BlogLayout';
import BlogContent from '../components/blog/BlogContent';
import BlogComments from '../components/blog/BlogComments';
import { format } from 'date-fns';
// motion is not used in this component
import { FiTag, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading article..." />
      </div>
    );
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
    >
      {/* SEO */}
      <Helmet>
        <title>{post.title}</title>
        <meta name="description" content={post.summary || `Read ${post.title}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary || `Read ${post.title}`} />
        {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Article metadata */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 text-sm">
          {post.category && (
            <Link
              to={`/blog?category=${post.category.id}`}
              className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
            >
              {post.category.name}
            </Link>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center">
              <FiTag className="mr-2" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/blog?tag=${tag.slug}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <BlogContent ref={contentRef} content={post.content} />
      </article>

      {/* Author section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FiUser className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {'Admin'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Content creator and writer passionate about sharing knowledge and insights.
            </p>
          </div>
        </div>
      </div>

      {/* Post navigation */}
      <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prevPost && (
            <Link
              to={`/blog/${prevPost.slug}`}
              className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Previous Article</span>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {prevPost.title}
              </h4>
            </Link>
          )}

          {nextPost && (
            <Link
              to={`/blog/${nextPost.slug}`}
              className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors md:text-right md:ml-auto"
            >
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Next Article</span>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {nextPost.title}
              </h4>
            </Link>
          )}
        </div>
      </nav>

      {/* Comments section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>
        <BlogComments postId={post.id} />
      </div>
    </BlogLayout>
  );
};

export default BlogPostPage;
