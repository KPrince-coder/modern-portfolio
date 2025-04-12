import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';

// Components
import BlogPostsList from '../components/blog/BlogPostsList';
import BlogPostForm from '../components/blog/BlogPostForm';
import BlogCategoriesList from '../components/blog/BlogCategoriesList';
import BlogTagsList from '../components/blog/BlogTagsList';
import BlogCommentsList from '../components/blog/BlogCommentsList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
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

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface BlogComment {
  id: string;
  post_id: string;
  parent_id?: string;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

type BlogView = 'posts' | 'form' | 'categories' | 'tags' | 'comments';

const BlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const queryClient = useQueryClient();
  const [view, setView] = useState<BlogView>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Redirect to form view if ID is provided or if we're on the 'new' route
  useEffect(() => {
    // Check if we're on the 'new' route
    const isNewRoute = window.location.pathname.endsWith('/new');

    if (id) {
      setView('form');
      setSelectedPostId(id);
    } else if (isNewRoute) {
      setView('form');
      setSelectedPostId(null);
    } else if (view === 'form' && !isNewRoute) {
      setView('posts');
      setSelectedPostId(null);
    }
  }, [id, view]);

  // Fetch blog posts
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ['blogPosts', searchQuery, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          category:category_id(id, name)
        `)
        .order('published_at', { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as (BlogPost & { category: { id: string; name: string } })[];
    },
    enabled: isAuthenticated && !authLoading && view === 'posts',
  });

  // Fetch blog categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as BlogCategory[];
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch blog tags
  const {
    data: tags,
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery({
    queryKey: ['blogTags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as BlogTag[];
    },
    enabled: isAuthenticated && !authLoading && (view === 'tags' || view === 'form'),
  });

  // Fetch single blog post if ID is provided
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery({
    queryKey: ['blogPost', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:category_id(id, name),
          tags:portfolio.blog_post_tags(tag_id(id, name, slug))
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Format tags array
      const formattedTags = data.tags.map((tag: any) => ({
        id: tag.tag_id.id,
        name: tag.tag_id.name,
        slug: tag.tag_id.slug,
      }));

      return { ...data, tags: formattedTags } as BlogPost & {
        category: { id: string; name: string };
        tags: { id: string; name: string; slug: string }[];
      };
    },
    enabled: isAuthenticated && !authLoading && !!id,
  });

  // Fetch comments for a specific post
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['blogComments', selectedPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', selectedPostId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as BlogComment[];
    },
    enabled: isAuthenticated && !authLoading && view === 'comments' && !!selectedPostId,
  });

  // Delete blog post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deletePostMutation.mutateAsync(postId);
      } catch (error) {
        console.error('Error deleting blog post:', error);
      }
    }
  };

  // Handle view changes
  const handleViewChange = (newView: BlogView, postId?: string) => {
    setView(newView);

    if (newView === 'form' && postId) {
      navigate(`/admin/blog/${postId}`);
    } else if (newView === 'form' && !postId) {
      navigate('/admin/blog/new');
    } else if (newView === 'posts') {
      navigate('/admin/blog');
      // Clear selected post ID when going back to posts view
      setSelectedPostId(null);
    } else if (newView === 'comments' && postId) {
      setSelectedPostId(postId);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Error state
  if (postsError || categoriesError || tagsError || postError || commentsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(postsError as Error)?.message ||
              (categoriesError as Error)?.message ||
              (tagsError as Error)?.message ||
              (postError as Error)?.message ||
              (commentsError as Error)?.message ||
              'An error occurred while fetching data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blog</h1>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <Button
              variant={view === 'posts' ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('posts')}
            >
              All Posts
            </Button>
            <Button
              variant={view === 'form' && (window.location.pathname.endsWith('/new') || !id) ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('form')}
            >
              Add Post
            </Button>
            <Button
              variant={view === 'categories' ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('categories')}
            >
              Categories
            </Button>
            <Button
              variant={view === 'tags' ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('tags')}
            >
              Tags
            </Button>
            {selectedPostId && (
              <Button
                variant={view === 'comments' ? 'primary' : 'secondary'}
                onClick={() => handleViewChange('comments', selectedPostId)}
              >
                Comments
              </Button>
            )}
          </div>
        </motion.div>

        <div className="mt-6">
          {view === 'posts' && (
            <BlogPostsList
              posts={posts || []}
              categories={categories || []}
              isLoading={postsLoading || categoriesLoading}
              onDelete={handleDeletePost}
              onEdit={(postId: string) => handleViewChange('form', postId)}
              onViewComments={(postId: string) => handleViewChange('comments', postId)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
          )}

          {view === 'form' && (
            <BlogPostForm
              post={post}
              categories={categories || []}
              tags={tags || []}
              isLoading={postLoading || categoriesLoading || tagsLoading}
              onCancel={() => handleViewChange('posts')}
            />
          )}

          {view === 'categories' && (
            <BlogCategoriesList
              categories={categories || []}
              isLoading={categoriesLoading}
              onBack={() => handleViewChange('posts')}
            />
          )}

          {view === 'tags' && (
            <BlogTagsList
              tags={tags || []}
              isLoading={tagsLoading}
              onBack={() => handleViewChange('posts')}
            />
          )}

          {view === 'comments' && selectedPostId && (
            <BlogCommentsList
              comments={comments || []}
              postId={selectedPostId}
              isLoading={commentsLoading}
              onBack={() => handleViewChange('posts')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
