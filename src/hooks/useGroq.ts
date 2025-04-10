import { useMutation } from '@tanstack/react-query';
import { groqAPI, BlogPostPrompt, EmailResponsePrompt } from '../lib/groq';

// Hook for generating blog posts
export const useGenerateBlogPost = () => {
  return useMutation({
    mutationFn: (prompt: BlogPostPrompt) => groqAPI.generateBlogPost(prompt),
  });
};

// Hook for generating email responses
export const useGenerateEmailResponse = () => {
  return useMutation({
    mutationFn: (prompt: EmailResponsePrompt) => groqAPI.generateEmailResponse(prompt),
  });
};
