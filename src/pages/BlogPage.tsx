import { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../components/layout/Container';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter blog posts based on selected category
  const filteredPosts = blogPosts.filter(post =>
    selectedCategory === 'all' || post.category === selectedCategory
  );

  // Get unique categories
  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];

  return (
    <Container>
      <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
          Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Thoughts, ideas, and insights on technology, design, and development.
        </p>
      </motion.div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map(category => (
          <button
            type="button"
            key={category}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Blog posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post, index) => (
          <BlogPostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No blog posts found in this category.
          </p>
        </div>
      )}
    </div>
    </Container>
  );
};

// Blog post card component
const BlogPostCard = ({ post, index }: { post: BlogPost; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
      {/* Placeholder for blog post image */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Category badge */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-indigo-600/80 text-white text-sm rounded-full backdrop-blur-sm">
          {post.category}
        </span>
      </div>
    </div>

    <div className="p-6">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
        <span>{formatDate(post.date)}</span>
        <span>•</span>
        <span>{post.readTime} min read</span>
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        {post.title}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {post.excerpt}
      </p>

      <div className="flex items-center gap-3 mt-4">
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

      <div className="mt-6">
        <a
          href={`/blog/${post.slug}`}
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Read More →
        </a>
      </div>
    </div>
  </motion.div>
);

// Helper function to format date
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Types
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  author: string;
  category: string;
}

// Sample data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Getting Started with React and TypeScript',
    slug: 'getting-started-with-react-and-typescript',
    excerpt: 'Learn how to set up a new React project with TypeScript and understand the benefits of using TypeScript in your React applications.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    date: '2023-06-15',
    readTime: 5,
    author: 'John Doe',
    category: 'react',
  },
  {
    id: 2,
    title: 'Building Accessible Web Applications',
    slug: 'building-accessible-web-applications',
    excerpt: 'Accessibility is crucial for creating inclusive web experiences. Learn the best practices for building accessible web applications.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    date: '2023-07-22',
    readTime: 8,
    author: 'Jane Smith',
    category: 'accessibility',
  },
  {
    id: 3,
    title: 'Introduction to Supabase: Firebase Alternative',
    slug: 'introduction-to-supabase',
    excerpt: 'Discover Supabase, an open-source Firebase alternative with PostgreSQL, authentication, and storage capabilities.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    date: '2023-08-10',
    readTime: 6,
    author: 'Alex Johnson',
    category: 'database',
  },
  {
    id: 4,
    title: 'Optimizing React Performance',
    slug: 'optimizing-react-performance',
    excerpt: 'Learn techniques and best practices for optimizing the performance of your React applications.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    date: '2023-09-05',
    readTime: 7,
    author: 'John Doe',
    category: 'react',
  },
  {
    id: 5,
    title: 'Integrating AI with Web Applications',
    slug: 'integrating-ai-with-web-applications',
    excerpt: 'Explore how to integrate AI capabilities into your web applications using modern APIs and services.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    date: '2023-10-18',
    readTime: 10,
    author: 'Sarah Williams',
    category: 'ai',
  },
  {
    id: 6,
    title: 'Modern CSS Techniques',
    slug: 'modern-css-techniques',
    excerpt: 'Discover modern CSS techniques like Grid, Flexbox, and CSS Variables to create responsive and maintainable layouts.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    date: '2023-11-02',
    readTime: 6,
    author: 'Mike Brown',
    category: 'css',
  },
];

export default BlogPage;
