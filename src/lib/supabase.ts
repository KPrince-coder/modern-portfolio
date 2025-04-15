import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Create a function to check if Supabase is reachable
const checkSupabaseConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

// Log connection status
checkSupabaseConnection().then(isConnected => {
  if (!isConnected) {
    console.error('Unable to connect to Supabase. Please check your network connection and Supabase service status.');
  } else {
    console.log('Successfully connected to Supabase.');
  }
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {schema: 'portfolio'},
  global: {
    fetch: (...args) => {
      // Add custom fetch logic here if needed
      return fetch(...args);
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    error: {
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500,
    },
  };
};

// Helper function to format data from Supabase
export const formatSupabaseData = <T>(data: T) => {
  return {
    data,
    error: null,
  };
};

// Helper function to get a unique session ID for the current user
export const getSessionId = (): string => {
  // Check if we already have a session ID in localStorage
  let sessionId = localStorage.getItem('portfolio_session_id');

  // If not, create a new one
  if (!sessionId) {
    // Generate a random ID
    sessionId = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

    // Store it in localStorage
    localStorage.setItem('portfolio_session_id', sessionId);
  }

  return sessionId;
};

// Helper function to check if user has a specific role
export const checkUserRole = async (userId: string, role: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id(name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return data.some((item: any) => item.roles.name === role);
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Helper function to log an audit event
export const logAuditEvent = async (
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
      });

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (error) {
    console.error('Error in logAuditEvent:', error);
  }
};

// Types for our database tables
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  image_url?: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  code_url?: string;
  case_study_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  category?: { id: string; name: string; slug: string };
  tags?: { id: string; name: string; slug: string }[];
  reading_time_minutes?: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  structured_data?: any;
  ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  is_replied: boolean;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

export interface PersonalData {
  id: number;
  name: string;
  title: string;
  bio: string;
  profile_image_url?: string;
  email: string;
  phone?: string;
  location?: string;
  resume_url?: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  icon: string;
  category?: string;
  display_order: number;
  level?: number;
  type?: 'technical' | 'soft';
}

export interface WorkExperience {
  id: number;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
  technologies: string[];
  display_order: number;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
  display_order: number;
}

export interface Interest {
  id: number;
  name: string;
  icon: string;
  display_order: number;
}

// Analytics data types
export interface AudienceDataItem {
  id: string;
  post_id: string;
  session_id: string;
  device_type: string;
  browser: string;
  country?: string;
  region?: string;
  city?: string;
  is_new_visitor: boolean;
  created_at: string;
}

export interface EngagementDataItem {
  id: string;
  post_id: string;
  session_id: string;
  scroll_depth?: number;
  element_type?: string;
  element_id?: string;
  interaction_type?: string;
  time_spent_seconds?: number;
  created_at: string;
}

// API functions
export const api = {
  // Projects
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  getProjectBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Blog posts
  getBlogPosts: async (options?: {
    limit?: number;
    page?: number;
    category?: string;
    tag?: string;
    search?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    featured?: boolean;
  }) => {
    const {
      limit = 10,
      page = 1,
      category,
      tag,
      search,
      orderBy = 'published_at',
      orderDirection = 'desc',
      featured
    } = options || {};

    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;

    // Start building the query
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:category_id(id, name, slug),
        tags:blog_post_tags(tag_id(id, name, slug))
      `)
      .eq('status', 'published')
      .order(orderBy, { ascending: orderDirection === 'asc' });

    // Apply filters if provided
    if (category) {
      // First try to filter by category ID
      if (category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('category_id', category);
      } else {
        // Otherwise filter by category slug through the join
        query = query.eq('category.slug', category);
      }
    }

    if (tag) {
      // Filter by tag through the join
      query = query.eq('tags.tag_id.slug', tag);
    }

    if (search) {
      // Full-text search on title and content
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) throw error;

    // Format the tags array for each post
    const formattedPosts = data?.map(post => {
      const formattedTags = post.tags?.map((tag: any) => ({
        id: tag.tag_id.id,
        name: tag.tag_id.name,
        slug: tag.tag_id.slug
      })) || [];

      return {
        ...post,
        tags: formattedTags
      };
    });

    return {
      posts: formattedPosts as BlogPost[],
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  },

  getBlogPostBySlug: async (slug: string) => {
    // Fetch the blog post
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:category_id(id, name, slug),
        tags:blog_post_tags(tag_id(id, name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    // Format the tags array
    const formattedTags = data.tags?.map((tag: any) => ({
      id: tag.tag_id.id,
      name: tag.tag_id.name,
      slug: tag.tag_id.slug
    })) || [];

    // Track the view using our utility function instead of missing RPC
    try {
      // Import the utility function
      const { trackBlogPostView } = await import('../utils/analyticsTracker');
      // Track the view with the post ID and AI generated flag
      await trackBlogPostView(data.id, data.ai_generated || false);
    } catch (trackError) {
      console.error('Error tracking blog post view:', trackError);
    }

    return { ...data, tags: formattedTags } as BlogPost;
  },

  // Blog categories
  getBlogCategories: async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Blog tags
  getBlogTags: async () => {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Blog comments
  getBlogComments: async (postId: string) => {
    // First get the post likes count
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (postError) console.error('Error fetching post likes count:', postError);

    // Then get the comments with their likes count
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*, likes_count')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Add post_likes_count to each comment for easy access
    return data.map(comment => ({
      ...comment,
      post_likes_count: postData?.likes_count || 0
    }));
  },

  submitBlogComment: async (comment: {
    post_id: string;
    parent_id?: string;
    author_name: string;
    author_email: string;
    author_website?: string;
    content: string;
  }) => {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert([{
        ...comment,
        is_approved: false // Comments require approval by default
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Blog analytics
  trackBlogShare: async (postId: string, platform: string) => {
    const { data, error } = await supabase
      .from('blog_post_shares')
      .insert([{
        post_id: postId,
        platform
      }]);

    if (error) throw error;
    return data;
  },

  trackBlogTimeSpent: async (postId: string, timeSpentSeconds: number) => {
    try {
      // Use the direct table update approach instead of RPC
      // First check if analytics record exists
      const { data: existingData, error: checkError } = await supabase
        .from('blog_post_analytics')
        .select('total_time_spent, view_count_for_time')
        .eq('post_id', postId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking blog post analytics:', checkError);
        throw checkError;
      }

      if (existingData) {
        // Update existing record
        const totalTimeSpent = (existingData.total_time_spent || 0) + timeSpentSeconds;
        const viewCountForTime = (existingData.view_count_for_time || 0) + 1;
        const avgTimeSpent = totalTimeSpent / viewCountForTime;

        const { error: updateError } = await supabase
          .from('blog_post_analytics')
          .update({
            total_time_spent: totalTimeSpent,
            view_count_for_time: viewCountForTime,
            avg_time_spent: avgTimeSpent,
            last_viewed_at: new Date().toISOString()
          })
          .eq('post_id', postId);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('blog_post_analytics')
          .insert({
            post_id: postId,
            avg_time_spent: timeSpentSeconds,
            total_time_spent: timeSpentSeconds,
            view_count_for_time: 1,
            views: 1,
            last_viewed_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking blog time spent:', error);
      // Return success anyway to prevent UI errors
      return { success: false, error };
    }
  },

  // Like a blog post
  likePost: async (postId: string, unlike: boolean = false) => {
    const userIdentifier = getSessionId();

    if (unlike) {
      // Unlike the post
      const { error } = await supabase
        .from('blog_post_likes')
        .delete()
        .match({ post_id: postId, user_identifier: userIdentifier });

      if (error) throw error;
      return { success: true, action: 'unliked' };
    } else {
      // Like the post
      const { data, error } = await supabase
        .from('blog_post_likes')
        .insert([{
          post_id: postId,
          user_identifier: userIdentifier
        }])
        .select();

      if (error) {
        // If the error is a unique violation, the user already liked the post
        if (error.code === '23505') {
          return { success: true, action: 'already_liked' };
        }
        throw error;
      }

      return { success: true, action: 'liked', data };
    }
  },

  // Like a comment
  likeComment: async (commentId: string, unlike: boolean = false) => {
    const userIdentifier = getSessionId();

    if (unlike) {
      // Unlike the comment
      const { error } = await supabase
        .from('blog_comment_likes')
        .delete()
        .match({ comment_id: commentId, user_identifier: userIdentifier });

      if (error) throw error;
      return { success: true, action: 'unliked' };
    } else {
      // Like the comment
      const { data, error } = await supabase
        .from('blog_comment_likes')
        .insert([{
          comment_id: commentId,
          user_identifier: userIdentifier
        }])
        .select();

      if (error) {
        // If the error is a unique violation, the user already liked the comment
        if (error.code === '23505') {
          return { success: true, action: 'already_liked' };
        }
        throw error;
      }

      return { success: true, action: 'liked', data };
    }
  },

  getRelatedBlogPosts: async (postId: string, limit: number = 3) => {
    try {
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .select('category_id, tags:blog_post_tags(tag_id)')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Extract tag IDs
      const tagIds = post.tags.map((tag: { tag_id: string }) => tag.tag_id);

      // Find posts with the same category
      let relatedPosts = [];

      if (post.category_id) {
        // First try to get posts from the same category
        const { data: categoryPosts, error: categoryError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            category:category_id(id, name, slug),
            tags:blog_post_tags(tag_id(id, name, slug))
          `)
          .eq('status', 'published')
          .eq('category_id', post.category_id)
          .neq('id', postId)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (!categoryError && categoryPosts) {
          relatedPosts = categoryPosts;
        }
      }

      // If we don't have enough posts from the same category and we have tags,
      // try to get posts with the same tags
      if (relatedPosts.length < limit && tagIds.length > 0) {
        const remainingLimit = limit - relatedPosts.length;

        // Get posts with matching tags, excluding ones we already have
        const excludeIds = [postId, ...relatedPosts.map(p => p.id)];

        const { data: tagPosts, error: tagError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            category:category_id(id, name, slug),
            tags:blog_post_tags(tag_id(id, name, slug))
          `)
          .eq('status', 'published')
          .not('id', 'in', `(${excludeIds.join(',')})`) // Exclude posts we already have
          .order('published_at', { ascending: false })
          .limit(remainingLimit);

        if (!tagError && tagPosts) {
          // Filter posts that have at least one matching tag
          const postsWithMatchingTags = tagPosts.filter(post => {
            const postTagIds = post.tags.map((tag: any) => tag.tag_id.id);
            return postTagIds.some((tagId: string) => tagIds.includes(tagId));
          });

          relatedPosts = [...relatedPosts, ...postsWithMatchingTags];
        }
      }

      // If we still don't have enough posts, get the most recent ones
      if (relatedPosts.length < limit) {
        const remainingLimit = limit - relatedPosts.length;
        const excludeIds = [postId, ...relatedPosts.map(p => p.id)];

        const { data: recentPosts, error: recentError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            category:category_id(id, name, slug),
            tags:blog_post_tags(tag_id(id, name, slug))
          `)
          .eq('status', 'published')
          .not('id', 'in', `(${excludeIds.join(',')})`) // Exclude posts we already have
          .order('published_at', { ascending: false })
          .limit(remainingLimit);

        if (!recentError && recentPosts) {
          relatedPosts = [...relatedPosts, ...recentPosts];
        }
      }

      // Format the tags array for each post
      const formattedPosts = relatedPosts.map(post => {
        const formattedTags = post.tags?.map((tag: { tag_id: { id: string; name: string; slug: string } }) => ({
          id: tag.tag_id.id,
          name: tag.tag_id.name,
          slug: tag.tag_id.slug
        })) || [];

        return {
          ...post,
          tags: formattedTags
        };
      });

      return formattedPosts as BlogPost[];
    } catch (error) {
      console.error('Error fetching related blog posts:', error);
      return [];
    }
  },

  // Contact messages
  submitContactMessage: async (message: Omit<ContactMessage, 'id' | 'created_at' | 'is_read' | 'is_replied'>) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          ...message,
          is_read: false,
          is_replied: false
        }
      ])
      .select();

    if (error) throw error;
    return data[0] as ContactMessage;
  },

  // Personal data
  getPersonalData: async () => {
    const { data, error } = await supabase
      .from('personal_data')
      .select('*')
      .single();

    if (error) throw error;
    return data as PersonalData;
  },

  // Social links
  getSocialLinks: async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as SocialLink[];
  },

  // Skills
  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('type', 'technical')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Skill[];
  },

  // Soft Skills
  getSoftSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('type', 'soft')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Skill[];
  },

  // Work Experience
  getWorkExperience: async () => {
    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as WorkExperience[];
  },

  // Education
  getEducation: async () => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Education[];
  },

  // Interests
  getInterests: async () => {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Interest[];
  },

  // Blog Analytics
  getBlogAnalyticsSummary: async (timeRange?: { startDate: string; endDate: string }) => {
    // Build query with time range filter if provided
    let query = supabase
      .from('blog_post_analytics')
      .select(`
        id,
        post_id,
        views,
        shares,
        avg_time_spent,
        total_time_spent,
        view_count_for_time,
        ai_generated,
        ai_feedback_rating,
        ai_feedback_count,
        created_at,
        last_viewed_at,
        blog_posts:post_id(title, slug)
      `);

    // Apply time range filter if provided
    if (timeRange && timeRange.startDate && timeRange.endDate) {
      query = query.gte('created_at', timeRange.startDate)
                   .lte('created_at', timeRange.endDate);
    }

    // Execute query
    const { data: overallData, error: overallError } = await query;

    if (overallError) throw overallError;

    // Get AI content performance comparison
    // Note: The RPC function doesn't accept time range parameters directly
    // In a production environment, you would modify the RPC function to accept these parameters
    const { data: aiPerformanceData, error: aiPerformanceError } = await supabase
      .rpc('get_ai_content_performance');

    if (aiPerformanceError) throw aiPerformanceError;

    // Get share analytics with time range filter
    let shareQuery = supabase
      .from('blog_post_shares')
      .select(`
        id,
        post_id,
        platform,
        shared_at,
        blog_posts:post_id(title, slug)
      `);

    // Apply time range filter if provided
    if (timeRange && timeRange.startDate && timeRange.endDate) {
      shareQuery = shareQuery.gte('shared_at', timeRange.startDate)
                            .lte('shared_at', timeRange.endDate);
    }

    const { data: shareData, error: shareError } = await shareQuery;

    if (shareError) throw shareError;

    // Get AI feedback with time range filter
    let feedbackQuery = supabase
      .from('ai_content_feedback')
      .select(`
        id,
        post_id,
        rating,
        feedback,
        created_at,
        blog_posts:post_id(title, slug)
      `);

    // Apply time range filter if provided
    if (timeRange && timeRange.startDate && timeRange.endDate) {
      feedbackQuery = feedbackQuery.gte('created_at', timeRange.startDate)
                                 .lte('created_at', timeRange.endDate);
    }

    const { data: feedbackData, error: feedbackError } = await feedbackQuery;

    if (feedbackError) throw feedbackError;

    // Get audience data (device, browser, location) with time range filter
    // Use a simpler select to avoid relationship ambiguity
    let audienceQuery = supabase
      .from('blog_audience_data')
      .select(`
        id,
        post_id,
        session_id,
        device_type,
        browser,
        country,
        region,
        city,
        is_new_visitor,
        created_at
      `);

    // Apply time range filter if provided
    if (timeRange && timeRange.startDate && timeRange.endDate) {
      audienceQuery = audienceQuery.gte('created_at', timeRange.startDate)
                                  .lte('created_at', timeRange.endDate);
    }

    const { data: audienceData, error: audienceError } = await audienceQuery;

    if (audienceError) throw audienceError;

    // Get content engagement data (scroll depth, element interactions) with time range filter
    // Use a simpler select to avoid relationship ambiguity
    let engagementQuery = supabase
      .from('blog_content_engagement')
      .select(`
        id,
        post_id,
        session_id,
        scroll_depth,
        element_type,
        element_id,
        interaction_type,
        time_spent_seconds,
        created_at
      `);

    // Apply time range filter if provided
    if (timeRange && timeRange.startDate && timeRange.endDate) {
      engagementQuery = engagementQuery.gte('created_at', timeRange.startDate)
                                      .lte('created_at', timeRange.endDate);
    }

    const { data: engagementData, error: engagementError } = await engagementQuery;

    if (engagementError) throw engagementError;

    // Calculate summary metrics
    const totalViews = overallData.reduce((sum, item) => sum + item.views, 0);
    const totalShares = shareData.length;
    const avgTimeSpent = overallData.reduce((sum, item) => sum + (item.avg_time_spent || 0), 0) /
      overallData.filter(item => item.avg_time_spent).length || 0;

    // Get top posts by views
    const topPostsByViews = [...overallData]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(item => ({
        id: item.post_id,
        title: item.blog_posts?.title || 'Unknown',
        slug: item.blog_posts?.slug || '',
        views: item.views,
        shares: item.shares,
        avgTimeSpent: item.avg_time_spent,
        aiGenerated: item.ai_generated
      }));

    // Get top posts by time spent
    const topPostsByTimeSpent = [...overallData]
      .sort((a, b) => (b.avg_time_spent || 0) - (a.avg_time_spent || 0))
      .slice(0, 10)
      .map(item => ({
        id: item.post_id,
        title: item.blog_posts?.title || 'Unknown',
        slug: item.blog_posts?.slug || '',
        views: item.views,
        avgTimeSpent: item.avg_time_spent,
        aiGenerated: item.ai_generated
      }));

    // Get share distribution by platform
    const sharesByPlatform = shareData.reduce((acc: Record<string, number>, item) => {
      const platform = item.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    // Format share distribution for chart
    const shareDistribution = Object.entries(sharesByPlatform).map(([platform, count]) => ({
      platform,
      count,
      percentage: Math.round((count / (shareData.length || 1)) * 100)
    }));

    // Define types for audience and engagement data
    interface AudienceDataItem {
      id: string;
      post_id: string;
      session_id: string;
      device_type: string;
      browser: string;
      country?: string;
      region?: string;
      city?: string;
      is_new_visitor: boolean;
      created_at: string;
    }

    interface EngagementDataItem {
      id: string;
      post_id: string;
      session_id: string;
      scroll_depth?: number;
      element_type?: string;
      element_id?: string;
      interaction_type?: string;
      time_spent_seconds?: number;
      created_at: string;
    }

    // Process audience data
    const deviceDistribution = audienceData ? audienceData.reduce((acc: Record<string, number>, item: AudienceDataItem) => {
      const device = item.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {}) : {};

    const browserDistribution = audienceData ? audienceData.reduce((acc: Record<string, number>, item: AudienceDataItem) => {
      const browser = item.browser || 'unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {}) : {};

    const locationDistribution = audienceData ? audienceData.reduce((acc: Record<string, number>, item: AudienceDataItem) => {
      const country = item.country || 'unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {}) : {};

    // Process engagement data
    const scrollDepthData = engagementData ? engagementData.reduce((acc: Record<string, number>, item: EngagementDataItem) => {
      const depth = item.scroll_depth || 'unknown';
      acc[depth] = (acc[depth] || 0) + 1;
      return acc;
    }, {}) : {};

    const elementInteractionData = engagementData ? engagementData.reduce((acc: Record<string, number>, item: EngagementDataItem) => {
      const element = item.element_type || 'unknown';
      acc[element] = (acc[element] || 0) + 1;
      return acc;
    }, {}) : {};

    return {
      summary: {
        totalViews,
        totalShares,
        avgTimeSpent,
        totalPosts: overallData.length,
        aiGeneratedPosts: overallData.filter(item => item.ai_generated).length,
        avgAiFeedbackRating: overallData.reduce((sum, item) => sum + (item.ai_feedback_rating || 0), 0) /
          (overallData.filter(item => item.ai_feedback_count > 0).length || 1)
      },
      aiPerformance: aiPerformanceData || [],
      topPostsByViews,
      topPostsByTimeSpent,
      shareDistribution,
      audienceInsights: {
        deviceDistribution,
        browserDistribution,
        locationDistribution,
        newVsReturning: {
          new: audienceData.filter((item: any) => item.is_new_visitor).length,
          returning: audienceData.filter((item: any) => !item.is_new_visitor).length
        }
      },
      contentEngagement: {
        scrollDepthData,
        elementInteractionData,
        scrollDepthDistribution: {
          '0-25': engagementData.filter((item: any) => item.scroll_depth && item.scroll_depth <= 25).length,
          '26-50': engagementData.filter((item: any) => item.scroll_depth && item.scroll_depth > 25 && item.scroll_depth <= 50).length,
          '51-75': engagementData.filter((item: any) => item.scroll_depth && item.scroll_depth > 50 && item.scroll_depth <= 75).length,
          '76-100': engagementData.filter((item: any) => item.scroll_depth && item.scroll_depth > 75).length
        },
        readingTimeDistribution: {
          'less_than_1_min': engagementData.filter((item: any) => (item.time_spent_seconds || 0) < 60).length,
          '1_to_3_min': engagementData.filter((item: any) => (item.time_spent_seconds || 0) >= 60 && (item.time_spent_seconds || 0) < 180).length,
          '3_to_5_min': engagementData.filter((item: any) => (item.time_spent_seconds || 0) >= 180 && (item.time_spent_seconds || 0) < 300).length,
          '5_to_10_min': engagementData.filter((item: any) => (item.time_spent_seconds || 0) >= 300 && (item.time_spent_seconds || 0) < 600).length,
          'more_than_10_min': engagementData.filter((item: any) => (item.time_spent_seconds || 0) >= 600).length
        },
        avgScrollDepth: engagementData.length > 0 ?
          engagementData.reduce((sum: number, item: any) => sum + (item.scroll_depth || 0), 0) /
          engagementData.filter((item: any) => item.scroll_depth !== null && item.scroll_depth !== undefined).length : 0,
        completionRate: engagementData.length > 0 ?
          (engagementData.filter((item: any) => item.scroll_depth && item.scroll_depth >= 90).length /
           engagementData.filter((item: any) => item.scroll_depth !== null && item.scroll_depth !== undefined).length) * 100 : 0,
        avgTimeSpentPerInteraction: engagementData.length > 0 ?
          engagementData.reduce((sum: number, item: any) => sum + (item.time_spent_seconds || 0), 0) /
          engagementData.filter((item: any) => item.time_spent_seconds !== null && item.time_spent_seconds !== undefined).length : 0
      },
      rawData: {
        overallData,
        shareData,
        feedbackData,
        audienceData: audienceData || [],
        engagementData: engagementData || []
      }
    };
  },

  // Get detailed analytics for a specific blog post
  getBlogPostAnalytics: async (postId: string) => {
    // Get post analytics
    const { data: postAnalytics, error: postError } = await supabase
      .from('blog_post_analytics')
      .select('*')
      .eq('post_id', postId)
      .single();

    if (postError) throw postError;

    // Get post shares
    const { data: shareData, error: shareError } = await supabase
      .from('blog_post_shares')
      .select('*')
      .eq('post_id', postId);

    if (shareError) throw shareError;

    // Get AI feedback if applicable
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('ai_content_feedback')
      .select('*')
      .eq('post_id', postId);

    if (feedbackError) throw feedbackError;

    // Get the blog post details
    const { data: postData, error: postDetailsError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postDetailsError) throw postDetailsError;

    // Get audience data for this post
    // Use a more explicit select to avoid relationship ambiguity
    const { data: audienceData, error: audienceError } = await supabase
      .from('blog_audience_data')
      .select(`
        id,
        post_id,
        session_id,
        device_type,
        browser,
        country,
        region,
        city,
        is_new_visitor,
        created_at
      `)
      .eq('post_id', postId);

    if (audienceError) throw audienceError;

    // Get content engagement data for this post
    // Use a more explicit select to avoid relationship ambiguity
    const { data: engagementData, error: engagementError } = await supabase
      .from('blog_content_engagement')
      .select(`
        id,
        post_id,
        session_id,
        scroll_depth,
        element_type,
        element_id,
        interaction_type,
        time_spent_seconds,
        created_at
      `)
      .eq('post_id', postId);

    if (engagementError) throw engagementError;

    // Calculate share distribution by platform
    const sharesByPlatform = shareData.reduce((acc: Record<string, number>, item) => {
      const platform = item.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    // Using the AudienceDataItem and EngagementDataItem interfaces defined at the top of the file

    // Process audience data
    const deviceDistribution = audienceData ? audienceData.reduce((acc: Record<string, number>, item: AudienceDataItem) => {
      const device = item.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {}) : {};

    const browserDistribution = audienceData ? audienceData.reduce((acc: Record<string, number>, item: AudienceDataItem) => {
      const browser = item.browser || 'unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {}) : {};

    const locationDistribution = audienceData ? audienceData.reduce((acc: Record<string, number>, item: AudienceDataItem) => {
      const country = item.country || 'unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {}) : {};

    const newVsReturningVisitors = {
      new: audienceData ? audienceData.filter(item => item.is_new_visitor).length : 0,
      returning: audienceData ? audienceData.filter(item => !item.is_new_visitor).length : 0
    };

    // Process engagement data
    const scrollDepthDistribution = engagementData ? {
      labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
      values: [
        engagementData.filter(item => item.scroll_depth <= 25).length,
        engagementData.filter(item => item.scroll_depth > 25 && item.scroll_depth <= 50).length,
        engagementData.filter(item => item.scroll_depth > 50 && item.scroll_depth <= 75).length,
        engagementData.filter(item => item.scroll_depth > 75).length
      ]
    } : { labels: [], values: [] };

    // Process element interactions
    const elementInteractions = engagementData ? engagementData.reduce((acc: Record<string, number>, item: EngagementDataItem) => {
      const element = item.element_type || 'unknown';
      acc[element] = (acc[element] || 0) + 1;
      return acc;
    }, {}) : {};

    const elementInteractionData = {
      elements: Object.keys(elementInteractions),
      interactions: Object.values(elementInteractions) as number[]
    };

    // Process reading time distribution
    const readingTimeDistribution = {
      labels: ['< 1 min', '1-3 min', '3-5 min', '5-10 min', '> 10 min'],
      values: [
        engagementData ? engagementData.filter(item => (item.time_spent_seconds || 0) < 60).length : 0,
        engagementData ? engagementData.filter(item => (item.time_spent_seconds || 0) >= 60 && (item.time_spent_seconds || 0) < 180).length : 0,
        engagementData ? engagementData.filter(item => (item.time_spent_seconds || 0) >= 180 && (item.time_spent_seconds || 0) < 300).length : 0,
        engagementData ? engagementData.filter(item => (item.time_spent_seconds || 0) >= 300 && (item.time_spent_seconds || 0) < 600).length : 0,
        engagementData ? engagementData.filter(item => (item.time_spent_seconds || 0) >= 600).length : 0
      ]
    };

    // Calculate engagement metrics
    const avgScrollDepth = engagementData && engagementData.length > 0
      ? engagementData.reduce((sum, item) => sum + (item.scroll_depth || 0), 0) / engagementData.length
      : 0;

    const completionRate = engagementData && engagementData.length > 0
      ? (engagementData.filter(item => (item.scroll_depth || 0) >= 90).length / engagementData.length) * 100
      : 0;

    const interactionRate = engagementData && engagementData.length > 0
      ? (engagementData.filter(item => item.element_type).length / engagementData.length) * 100
      : 0;

    // Generate content optimization tips based on analytics
    const optimizationTips = [];

    // Tip for scroll depth
    if (avgScrollDepth < 50) {
      optimizationTips.push({
        title: 'Improve Content Engagement',
        description: 'Average scroll depth is below 50%. Consider making your content more engaging with better hooks, visuals, or breaking up text into smaller paragraphs.',
        type: 'warning'
      });
    } else if (avgScrollDepth >= 75) {
      optimizationTips.push({
        title: 'Strong Content Engagement',
        description: 'Your content has excellent scroll depth (75%+). Keep using this style and structure in future posts.',
        type: 'success'
      });
    }

    // Tip for completion rate
    if (completionRate < 40) {
      optimizationTips.push({
        title: 'Low Completion Rate',
        description: 'Less than 40% of readers are completing your post. Consider shortening the content or adding more engaging elements throughout.',
        type: 'warning'
      });
    }

    // Tip for mobile optimization if high mobile usage
    const mobilePercentage = deviceDistribution['mobile']
      ? (deviceDistribution['mobile'] / Object.values(deviceDistribution).reduce((a, b) => a + b, 0)) * 100
      : 0;

    if (mobilePercentage > 40) {
      optimizationTips.push({
        title: 'Optimize for Mobile',
        description: `${Math.round(mobilePercentage)}% of your readers are on mobile devices. Ensure your content is mobile-friendly with appropriate font sizes and image scaling.`,
        type: 'info'
      });
    }

    // Tip for element interactions
    if (interactionRate < 10) {
      optimizationTips.push({
        title: 'Increase Interactive Elements',
        description: 'Your content has low interaction rates. Consider adding more clickable elements like links to related content, interactive examples, or media.',
        type: 'info'
      });
    }

    return {
      post: postData,
      analytics: postAnalytics,
      shares: {
        total: shareData.length,
        byPlatform: sharesByPlatform,
        history: shareData
      },
      feedback: feedbackData,
      audience: {
        deviceDistribution: {
          labels: Object.keys(deviceDistribution),
          values: Object.values(deviceDistribution)
        },
        locationDistribution: {
          labels: Object.keys(locationDistribution),
          values: Object.values(locationDistribution)
        },
        newVsReturning: newVsReturningVisitors,
        browserDistribution
      },
      engagement: {
        metrics: {
          avgScrollDepth,
          completionRate,
          interactionRate,
          avgTimeSpent: postAnalytics?.avg_time_spent || 0
        },
        scrollDepthDistribution,
        elementInteractionData,
        readingTimeDistribution
      },
      optimization: {
        tips: optimizationTips
      },
      rawData: {
        audienceData: audienceData || [],
        engagementData: engagementData || []
      }
    };
  },
};

export default supabase;
