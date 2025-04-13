import React, { ReactNode, useRef } from 'react';
import { Link } from 'react-router-dom';
import PostNavigation from '../components/blog/PostNavigation';
import BlogNavHeader from '../components/blog/BlogNavHeader';
import ShareWidget from '../components/blog/ShareWidget';
import TableOfContents from '../components/blog/TableOfContents';
import BlogThemeToggler from '../components/blog/BlogThemeToggler';
import BlogComments from '../components/blog/BlogComments';
import '../styles/BlogOverflowFix.css';

interface BlogLayoutProps {
  children: ReactNode;
  title?: string;
  author?: string;
  date?: string;
  readTime?: string;
  coverImage?: string;
  slug?: string;
  summary?: string;
  tags?: Array<{ id: string; name: string; slug: string }>;
  category?: { id: string; name: string; slug: string };
  postId?: string;
  prevPost: { id: string; title: string; slug: string; featured_image_url?: string } | null;
  nextPost: { id: string; title: string; slug: string; featured_image_url?: string } | null;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  title,
  author,
  date,
  readTime,
  coverImage,
  slug,
  summary,
  tags,
  category,
  postId,
  prevPost,
  nextPost
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navigation header with scrolling title */}
      <BlogNavHeader
        title={title || ''}
        url={currentUrl}
        imageUrl={coverImage}
        summary={summary || ''}
      />

      {/* Main content */}
      <main className="pt-24 pb-20">
        {/* Cover image */}
        {coverImage && (
          <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10" />
            <img
              src={coverImage}
              alt={title || 'Blog post cover image'}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-3">
              {/* Title and metadata */}
              {title && (
                <div className="mb-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{title}</h1>
                  <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 text-sm md:text-base gap-2 md:gap-4">
                    {author && (
                      <span className="inline-flex items-center">
                        <span className="font-medium">{author}</span>
                      </span>
                    )}
                    {date && (
                      <>
                        <span className="hidden md:inline">•</span>
                        <span>{date}</span>
                      </>
                    )}
                    {readTime && (
                      <>
                        <span className="hidden md:inline">•</span>
                        <span>{readTime} read</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Blog content */}
              <div className="blog-content-wrapper overflow-hidden">
                <article className="prose prose-lg dark:prose-invert max-w-none" ref={contentRef}>
                  {children}
                </article>
              </div>

              {/* Share widget */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <ShareWidget
                  url={currentUrl}
                  title={title || ''}
                  summary={summary || ''}
                  imageUrl={coverImage}
                />
              </div>

              {/* Post navigation */}
              {(prevPost || nextPost) && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <PostNavigation prevPost={prevPost} nextPost={nextPost} />
                </div>
              )}

              {/* Comments section */}
              {postId && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <BlogComments postId={postId} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Table of contents */}
                <TableOfContents contentRef={contentRef} className="mb-8" />

                {/* Theme toggler */}
                <div className="mb-8 flex justify-center">
                  <BlogThemeToggler />
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Link
                          key={tag.id}
                          to={`/blog?tag=${tag.slug}`}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to blog */}
                <div className="mb-8">
                  <Link
                    to="/blog"
                    className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center transition-colors"
                  >
                    View All Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related posts */}
          {postId && (
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
              {/* Import and use RelatedPosts component here */}
              {/* <RelatedPosts postId={postId} /> */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h2>
              <p className="text-gray-600 dark:text-gray-400">Loading related articles...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              Back to Portfolio
            </Link>
            <div className="flex items-center space-x-4">
              <ShareWidget
                url={currentUrl}
                title={title || ''}
                compact
              />
              <BlogThemeToggler />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogLayout;
