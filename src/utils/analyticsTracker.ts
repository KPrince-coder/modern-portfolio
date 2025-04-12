/**
 * Utility functions for tracking analytics
 */
import { supabase } from '../lib/supabase';

/**
 * Track a blog post view
 * @param postId Blog post ID
 * @param isAIGenerated Whether the post was AI-generated
 */
export const trackBlogPostView = async (
  postId: string,
  isAIGenerated: boolean
): Promise<void> => {
  try {
    // Get the current view count
    const { data, error } = await supabase
      .from('blog_post_analytics')
      .select('views')
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching blog post analytics:', error);
      return;
    }

    if (data) {
      // Update existing analytics
      await supabase
        .from('blog_post_analytics')
        .update({
          views: data.views + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('post_id', postId);
    } else {
      // Create new analytics entry
      await supabase
        .from('blog_post_analytics')
        .insert({
          post_id: postId,
          views: 1,
          ai_generated: isAIGenerated,
          last_viewed_at: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error tracking blog post view:', error);
  }
};

/**
 * Track time spent on a blog post
 * @param postId Blog post ID
 * @param timeInSeconds Time spent in seconds
 */
export const trackTimeSpent = async (
  postId: string,
  timeInSeconds: number
): Promise<void> => {
  try {
    // Get the current analytics
    const { data, error } = await supabase
      .from('blog_post_analytics')
      .select('avg_time_spent, total_time_spent, view_count_for_time')
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching blog post analytics:', error);
      return;
    }

    if (data) {
      // Calculate new average time spent
      const totalViews = data.view_count_for_time + 1;
      const totalTimeSpent = data.total_time_spent + timeInSeconds;
      const avgTimeSpent = totalTimeSpent / totalViews;

      // Update analytics
      await supabase
        .from('blog_post_analytics')
        .update({
          avg_time_spent: avgTimeSpent,
          total_time_spent: totalTimeSpent,
          view_count_for_time: totalViews,
        })
        .eq('post_id', postId);
    } else {
      // Create new analytics entry
      await supabase
        .from('blog_post_analytics')
        .insert({
          post_id: postId,
          avg_time_spent: timeInSeconds,
          total_time_spent: timeInSeconds,
          view_count_for_time: 1,
        });
    }
  } catch (error) {
    console.error('Error tracking time spent:', error);
  }
};

/**
 * Track a social share
 * @param postId Blog post ID
 * @param platform Platform shared on (e.g., 'twitter', 'facebook')
 */
export const trackSocialShare = async (
  postId: string,
  platform: string
): Promise<void> => {
  try {
    // Get the current share count
    const { data, error } = await supabase
      .from('blog_post_analytics')
      .select('shares')
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching blog post analytics:', error);
      return;
    }

    // Track the share
    const shareData = {
      post_id: postId,
      platform,
      shared_at: new Date().toISOString(),
    };

    await supabase
      .from('blog_post_shares')
      .insert(shareData);

    // Update the share count
    if (data) {
      await supabase
        .from('blog_post_analytics')
        .update({
          shares: data.shares + 1,
        })
        .eq('post_id', postId);
    } else {
      await supabase
        .from('blog_post_analytics')
        .insert({
          post_id: postId,
          shares: 1,
        });
    }
  } catch (error) {
    console.error('Error tracking social share:', error);
  }
};

/**
 * Track feedback on AI-generated content
 * @param postId Blog post ID
 * @param rating Rating (1-5)
 * @param feedback Optional feedback text
 */
export const trackAIFeedback = async (
  postId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  try {
    // Insert feedback
    await supabase
      .from('ai_content_feedback')
      .insert({
        post_id: postId,
        rating,
        feedback,
        created_at: new Date().toISOString(),
      });

    // Update average rating
    const { data, error } = await supabase
      .from('ai_content_feedback')
      .select('rating')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching AI feedback:', error);
      return;
    }

    if (data && data.length > 0) {
      const avgRating = data.reduce((sum, item) => sum + item.rating, 0) / data.length;

      await supabase
        .from('blog_post_analytics')
        .update({
          ai_feedback_rating: avgRating,
          ai_feedback_count: data.length,
        })
        .eq('post_id', postId);
    }
  } catch (error) {
    console.error('Error tracking AI feedback:', error);
  }
};

export default {
  trackBlogPostView,
  trackTimeSpent,
  trackSocialShare,
  trackAIFeedback,
};
