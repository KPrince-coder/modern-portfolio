import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { api, Project, BlogPost, ContactMessage, SocialLink, PersonalData, Skill, WorkExperience, Education, Interest } from '../lib/supabase';

// Create a client
export const queryClient = new QueryClient();

// Projects hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });
};

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => api.getProjectBySlug(slug),
    enabled: !!slug,
  });
};

// Blog posts hooks
export const useBlogPosts = (options?: {
  limit?: number;
  page?: number;
  category?: string;
  tag?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ['blogPosts', options],
    queryFn: () => api.getBlogPosts(options),
  });
};

export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => api.getBlogPostBySlug(slug),
    enabled: !!slug,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blogCategories'],
    queryFn: api.getBlogCategories,
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blogTags'],
    queryFn: api.getBlogTags,
  });
};

export const useBlogComments = (postId: string) => {
  return useQuery({
    queryKey: ['blogComments', postId],
    queryFn: () => api.getBlogComments(postId),
    enabled: !!postId,
  });
};

export const useSubmitBlogComment = () => {
  return useMutation({
    mutationFn: (comment: {
      post_id: string;
      parent_id?: string;
      author_name: string;
      author_email: string;
      author_website?: string;
      content: string;
    }) => api.submitBlogComment(comment),
    onSuccess: (_, variables) => {
      // Invalidate the comments query to refetch comments
      queryClient.invalidateQueries({ queryKey: ['blogComments', variables.post_id] });
    },
  });
};

export const useRelatedBlogPosts = (postId: string, limit: number = 3) => {
  return useQuery({
    queryKey: ['relatedBlogPosts', postId, limit],
    queryFn: () => api.getRelatedBlogPosts(postId, limit),
    enabled: !!postId,
  });
};

export const useTrackBlogShare = () => {
  return useMutation({
    mutationFn: ({ postId, platform }: { postId: string; platform: string }) =>
      api.trackBlogShare(postId, platform),
  });
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: ({ postId, unlike }: { postId: string; unlike?: boolean }) =>
      api.likePost(postId, unlike),
    onSuccess: (_, variables) => {
      // Invalidate the blog post query to refetch with updated likes count
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.postId] });
      // Also invalidate comments query since it might contain post_likes_count
      queryClient.invalidateQueries({ queryKey: ['blogComments', variables.postId] });
    },
  });
};

export const useLikeComment = () => {
  return useMutation({
    mutationFn: ({ commentId, unlike }: { commentId: string; unlike?: boolean }) =>
      api.likeComment(commentId, unlike),
    onSuccess: (_, variables) => {
      // Get the post ID from the comment ID by querying the cache
      const allCommentsQueries = queryClient.getQueriesData<any[]>({ queryKey: ['blogComments'] });

      // Iterate through all blogComments queries
      for (const [queryKey, comments] of allCommentsQueries) {
        if (Array.isArray(comments)) {
          const comment = comments.find(c => c.id === variables.commentId);
          if (comment?.post_id) {
            // Invalidate the specific comments query to refetch with updated likes count
            queryClient.invalidateQueries({ queryKey: ['blogComments', comment.post_id] });
            break; // Found the comment, no need to continue
          }
        }
      }
    },
  });
};

export const useTrackBlogTimeSpent = () => {
  return useMutation({
    mutationFn: ({ postId, timeSpentSeconds }: { postId: string; timeSpentSeconds: number }) =>
      api.trackBlogTimeSpent(postId, timeSpentSeconds),
  });
};

// Personal data hook
export const usePersonalData = () => {
  return useQuery({
    queryKey: ['personalData'],
    queryFn: api.getPersonalData,
    placeholderData: {
      // Fallback data if API fails
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate about creating beautiful and functional web applications. Specializing in React, TypeScript, and modern web technologies.',
      profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  });
};

// Contact message hook
export const useSubmitContactMessage = () => {
  return useMutation({
    mutationFn: (message: Omit<ContactMessage, 'id' | 'created_at' | 'is_read' | 'is_replied'>) =>
      api.submitContactMessage(message),
    onSuccess: () => {
      // Optionally invalidate queries or perform other actions on success
    },
  });
};

// Social links hook
export const useSocialLinks = () => {
  return useQuery({
    queryKey: ['socialLinks'],
    queryFn: api.getSocialLinks,
  });
};

// Blog analytics hooks
export const useBlogAnalyticsSummary = (timeRange?: { startDate: string; endDate: string }) => {
  return useQuery({
    queryKey: ['blogAnalyticsSummary', timeRange],
    queryFn: () => api.getBlogAnalyticsSummary(timeRange),
  });
};

export const useBlogPostAnalytics = (postId: string) => {
  return useQuery({
    queryKey: ['blogPostAnalytics', postId],
    queryFn: () => api.getBlogPostAnalytics(postId),
    enabled: !!postId,
  });
};

// Skills hooks
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: api.getSkills,
  });
};

export const useSoftSkills = () => {
  return useQuery({
    queryKey: ['softSkills'],
    queryFn: api.getSoftSkills,
  });
};

// Work experience hook
export const useWorkExperience = () => {
  return useQuery({
    queryKey: ['workExperience'],
    queryFn: api.getWorkExperience,
  });
};

// Education hook
export const useEducation = () => {
  return useQuery({
    queryKey: ['education'],
    queryFn: api.getEducation,
  });
};

// Interests hook
export const useInterests = () => {
  return useQuery({
    queryKey: ['interests'],
    queryFn: api.getInterests,
  });
};
