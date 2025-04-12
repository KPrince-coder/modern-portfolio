import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Container from '../components/layout/Container';
import BlogHeader from '../components/blog/BlogHeader';
import BlogSearch from '../components/blog/BlogSearch';
import BlogViewToggle, { ViewMode } from '../components/blog/BlogViewToggle';
import BlogFilters from '../components/blog/BlogFilters';
import BlogGrid from '../components/blog/BlogGrid';
import BlogList from '../components/blog/BlogList';
import BlogPagination from '../components/blog/BlogPagination';
import FeaturedBlogPost from '../components/blog/FeaturedBlogPost';
import { useBlogPosts, useBlogCategories, useBlogTags } from '../hooks/useSupabase';
import { useSearchParams } from 'react-router-dom';

const BlogPage = () => {
  // URL search params for shareable filters
  const [searchParams, setSearchParams] = useSearchParams();

  // State for filters and pagination
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);

  // Fetch blog posts with filters
  const {
    data: blogData,
    isLoading: isLoadingPosts,
  } = useBlogPosts({
    limit: postsPerPage,
    page: currentPage,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    tag: selectedTag !== 'all' ? selectedTag : undefined,
    search: searchQuery || undefined,
    orderBy: 'published_at',
    orderDirection: 'desc',
  });

  // Fetch featured blog post
  const {
    data: featuredData,
    isLoading: isLoadingFeatured,
  } = useBlogPosts({
    featured: true,
    limit: 1,
  });

  // Fetch categories and tags
  const { data: categories = [], isLoading: isLoadingCategories } = useBlogCategories();
  const { data: tags = [], isLoading: isLoadingTags } = useBlogTags();

  // Extract posts and pagination info
  const posts = blogData?.posts || [];
  const totalPages = blogData?.totalPages || 1;
  const featuredPost = featuredData?.posts?.[0];

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedTag !== 'all') params.set('tag', selectedTag);
    if (dateFilter !== 'all') params.set('date', dateFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (viewMode !== 'grid') params.set('view', viewMode);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedTag, dateFilter, currentPage, viewMode, setSearchParams]);

  // Initialize state from URL params on mount
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const date = searchParams.get('date');
    const page = searchParams.get('page');
    const view = searchParams.get('view');

    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
    if (tag) setSelectedTag(tag);
    if (date) setDateFilter(date as any);
    if (page) setCurrentPage(parseInt(page, 10));
    if (view === 'list') setViewMode('list');
  }, [searchParams]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  // Handle tag change
  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1); // Reset to first page on tag change
  };

  // Handle date filter change
  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    setCurrentPage(1); // Reset to first page on date filter change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container>
      <Helmet>
        <title>Blog | Modern Portfolio</title>
        <meta name="description" content="Explore our blog for insights on technology, design, and development." />
        <meta property="og:title" content="Blog | Modern Portfolio" />
        <meta property="og:description" content="Explore our blog for insights on technology, design, and development." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="py-16">
        {/* Blog Header */}
        <BlogHeader
          title="Blog"
          description="Thoughts, ideas, and insights on technology, design, and development."
        />

        {/* Featured Blog Post */}
        {!isLoadingFeatured && featuredPost && (
          <FeaturedBlogPost post={featuredPost} />
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <BlogSearch onSearch={handleSearch} initialQuery={searchQuery} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
            <BlogFilters
              categories={categories}
              tags={tags}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              onCategoryChange={handleCategoryChange}
              onTagChange={handleTagChange}
              onDateFilterChange={handleDateFilterChange}
            />

            <BlogViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Blog Posts */}
        {viewMode === 'grid' ? (
          <BlogGrid posts={posts} isLoading={isLoadingPosts} />
        ) : (
          <BlogList posts={posts} isLoading={isLoadingPosts} />
        )}

        {/* Pagination */}
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Container>
  );
};

export default BlogPage;
