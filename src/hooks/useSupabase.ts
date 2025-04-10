import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { api, Project, BlogPost, ContactMessage, SocialLink, PersonalData } from '../lib/supabase';

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
export const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: api.getBlogPosts,
  });
};

export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => api.getBlogPostBySlug(slug),
    enabled: !!slug,
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

// Personal data hook
export const usePersonalData = () => {
  return useQuery({
    queryKey: ['personalData'],
    queryFn: api.getPersonalData,
  });
};

// Social links hook
export const useSocialLinks = () => {
  return useQuery({
    queryKey: ['socialLinks'],
    queryFn: api.getSocialLinks,
  });
};
