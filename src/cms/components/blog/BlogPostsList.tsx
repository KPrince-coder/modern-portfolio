import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  category?: { id: string; name: string } | null;
  reading_time_minutes?: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface BlogPostsListProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  isLoading: boolean;
  onDelete: (postId: string) => void;
  onEdit: (postId: string) => void;
  onViewComments: (postId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'draft' | 'published' | 'archived';
  setStatusFilter: (status: 'all' | 'draft' | 'published' | 'archived') => void;
  categoryFilter: string;
  setCategoryFilter: (categoryId: string) => void;
}

const BlogPostsList: React.FC<BlogPostsListProps> = ({
  posts,
  categories,
  isLoading,
  onDelete,
  onEdit,
  onViewComments,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) => {
  // Get status badge color
  const getStatusBadgeColor = (status: string): 'gray' | 'blue' | 'green' | 'purple' => {
    switch (status) {
      case 'draft': return 'blue';
      case 'published': return 'green';
      case 'archived': return 'purple';
      default: return 'gray';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not published';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading blog posts..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="Search posts..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <div key={post.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {post.title}
                    </h2>
                    {post.is_featured && (
                      <Badge color="yellow" className="ml-2">
                        Featured
                      </Badge>
                    )}
                    {post.ai_generated && (
                      <Badge color="indigo" className="ml-2">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <Badge color={getStatusBadgeColor(post.status)}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </Badge>
                    
                    <span>
                      {post.category ? post.category.name : 'Uncategorized'}
                    </span>
                    
                    <span>
                      {formatDate(post.published_at)}
                    </span>
                    
                    {post.reading_time_minutes && (
                      <span>
                        {post.reading_time_minutes} min read
                      </span>
                    )}
                  </div>
                  
                  {post.summary && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {post.summary}
                    </p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap items-center space-x-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                    >
                      View Post
                    </a>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      onClick={() => onViewComments(post.id)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                    >
                      Comments
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col space-x-3 md:space-x-0 md:space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(post.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No blog posts found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating a new blog post'}
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => onEdit('new')}
            >
              Create New Post
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogPostsList;
