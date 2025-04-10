import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlogPostBySlug } from '../hooks/useSupabase';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug ?? '');

  if (isLoading) {
    return (
      <Container>
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Loading post..." />
        </div>
      </Container>
    );
  }

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

  return (
    <Container>
      <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Post header */}
        <div className="mb-12">
          <Link
            to="/blog"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-6">
            <span>{new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
            <span>•</span>
            <span>{post.read_time} min read</span>
            <span>•</span>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
              {post.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex items-center justify-center text-gray-500 dark:text-gray-400">
              {/* Placeholder for author avatar */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{post.author}</p>
            </div>
          </div>
        </div>

        {/* Post image */}
        <div className="mb-12 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="w-1/6 h-1/6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Post content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* In a real app, you would render the content with a markdown renderer */}
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {post.excerpt}
              </p>

              {/* Placeholder content */}
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
                Introduction
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
                Main Content
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-6">
                <pre className="font-code text-sm overflow-x-auto">
                  <code>
                    {`// Example code snippet
function calculateSomething(value) {
  return value * 2;
}

// Usage
const result = calculateSomething(21);
console.log(result); // 42`}
                  </code>
                </pre>
              </div>

              <p className="text-gray-600 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.
              </p>

              <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
                Subheading
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.
              </p>

              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
                <li>First item in the list</li>
                <li>Second item in the list</li>
                <li>Third item in the list</li>
                <li>Fourth item in the list</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
                Conclusion
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.
              </p>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Tags
              </h3>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Share this post
              </h3>

              <div className="flex gap-4">
                <button type="button" aria-label="Share on Twitter" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1DA1F2] text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>

                <button type="button" aria-label="Share on Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>

                <button type="button" aria-label="Share on LinkedIn" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A66C2] text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Author info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  About the Author
                </h3>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {post.author}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Content Writer
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies.
                </p>
              </div>

              {/* Related posts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Related Posts
                </h3>

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white text-sm line-clamp-2">
                          <Link to={`/blog/related-post-${i}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                            Related Post Title {i}
                          </Link>
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter signup */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Subscribe to Newsletter
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Get the latest posts delivered right to your inbox.
                </p>

                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />

                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </Container>
  );
};

export default BlogPostPage;
