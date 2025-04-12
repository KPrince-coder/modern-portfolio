import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPostBySlug, useBlogPosts } from '../hooks/useSupabase';
import { useTrackBlogReadTime } from '../utils/blogAnalytics';
import BlogDetailLayout from '../components/blog/BlogDetailLayout';
import BlogDetailHeader from '../components/blog/BlogDetailHeader';
import BlogContent from '../components/blog/BlogContent';
import BlogSidebar from '../components/blog/BlogSidebar';
import BlogShareButtons from '../components/blog/BlogShareButtons';
import BlogComments from '../components/blog/BlogComments';
import BlogNavigation from '../components/blog/BlogNavigation';
import BlogPostMeta from '../components/blog/BlogPostMeta';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Container from '../components/layout/Container';

// Type for adjacent posts
interface AdjacentPost {
  slug: string;
  title: string;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [prevPost, setPrevPost] = useState<AdjacentPost | null>(null);
  const [nextPost, setNextPost] = useState<AdjacentPost | null>(null);

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

  // Determine previous and next posts
  useEffect(() => {
    if (allPostsData?.posts && post) {
      const allPosts = allPostsData.posts;
      const currentIndex = allPosts.findIndex(p => p.slug === post.slug);

      if (currentIndex > 0) {
        setPrevPost({
          slug: allPosts[currentIndex - 1].slug,
          title: allPosts[currentIndex - 1].title,
        });
      } else {
        setPrevPost(null);
      }

      if (currentIndex < allPosts.length - 1) {
        setNextPost({
          slug: allPosts[currentIndex + 1].slug,
          title: allPosts[currentIndex + 1].title,
        });
      } else {
        setNextPost(null);
      }
    }
  }, [allPostsData, post]);

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Loading post..." />
        </div>
      </Container>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <Container>
        <div className="py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Post Not Found</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blog"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </Container>
    );
  }

  // Current URL for sharing
  const currentUrl = window.location.href;

  return (
    <BlogDetailLayout>
      {/* SEO and meta tags */}
      <BlogPostMeta post={post} url={currentUrl} />

      <div className="py-8">
        {/* Post header */}
        <BlogDetailHeader post={post} />

        {/* Post content and sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Blog content */}
            <BlogContent ref={contentRef} content={post.content} />

            {/* Share buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <BlogShareButtons
                postId={post.id}
                title={post.title}
                url={currentUrl}
              />
            </div>

            {/* Post navigation */}
            <BlogNavigation prevPost={prevPost} nextPost={nextPost} />

            {/* Comments section */}
            <BlogComments postId={post.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar
              postId={post.id}
              contentRef={contentRef}
              aiGenerated={post.ai_generated}
            />
          </div>
        </div>
      </div>
    </BlogDetailLayout>
  );
};

export default BlogPostPage;
