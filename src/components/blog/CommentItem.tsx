import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiCornerDownRight } from 'react-icons/fi';
import { useLikeComment, useSubmitBlogComment } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

interface CommentItemProps {
  comment: {
    id: string;
    post_id: string;
    parent_id?: string | null;
    author_name: string;
    author_email: string;
    author_website?: string;
    content: string;
    is_approved: boolean;
    likes_count: number;
    created_at: string;
    updated_at: string;
  };
  replies?: CommentItemProps['comment'][];
  level?: number;
  postId: string;
  isLiked?: boolean;
  onLikeToggle?: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  level = 0,
  postId,
  isLiked = false,
  onLikeToggle,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyWebsite, setReplyWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(comment.likes_count);

  // Update localLiked when isLiked prop changes
  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  // Fetch the actual likes count when the component mounts
  useEffect(() => {
    const fetchLikesCount = async () => {
      try {
        const { count } = await supabase
          .from('blog_comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id);

        if (count !== null) {
          setOptimisticLikesCount(count);
        }
      } catch (error) {
        console.error('Error fetching comment likes count:', error);
      }
    };

    fetchLikesCount();
  }, [comment.id]);

  const submitComment = useSubmitBlogComment();
  const likeComment = useLikeComment();

  // Format date for display
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMMM d, yyyy • h:mm a');
  };

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim() || !replyName.trim() || !replyEmail.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitComment.mutateAsync({
        post_id: postId,
        parent_id: comment.id,
        author_name: replyName,
        author_email: replyEmail,
        author_website: replyWebsite || undefined,
        content: replyContent,
      });

      // Reset form
      setReplyContent('');
      setReplyName('');
      setReplyEmail('');
      setReplyWebsite('');
      setShowReplyForm(false);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like toggle
  const handleLikeToggle = async () => {
    // Store the current state before updating
    const wasLiked = localLiked;
    const currentCount = optimisticLikesCount;

    // Optimistic update
    setLocalLiked(!wasLiked);
    setOptimisticLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      // Notify parent component immediately to update localStorage
      if (onLikeToggle) {
        onLikeToggle(comment.id);
      }

      // Call the API to update the like status
      await likeComment.mutateAsync({
        commentId: comment.id,
        unlike: wasLiked,
      });

      // After successful like/unlike, fetch the actual count to ensure accuracy
      const { count } = await supabase
        .from('blog_comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment.id);

      if (count !== null) {
        setOptimisticLikesCount(count);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLocalLiked(wasLiked);
      setOptimisticLikesCount(currentCount);

      // Revert in parent component too
      if (onLikeToggle) {
        onLikeToggle(comment.id); // Toggle back to original state
      }
    }
  };

  // Calculate indentation based on nesting level
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4 ${indentClass} ${level > 0 ? 'border-l-4 border-indigo-200 dark:border-indigo-900' : ''}`}
      >
        {/* Reply indicator for nested comments */}
        {level > 0 && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
            <FiCornerDownRight className="mr-2" />
            <span className="text-sm">Reply to {comment.parent_id}</span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {comment.author_name}
              {comment.author_website && (
                <a
                  href={comment.author_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  (Website)
                </a>
              )}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(comment.created_at)}
            </p>
          </div>
        </div>

        <div className="ml-14">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-4">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 text-sm ${
                localLiked
                  ? 'text-pink-600 dark:text-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
              } transition-colors cursor-pointer`}
              aria-label={localLiked ? 'Unlike comment' : 'Like comment'}
            >
              <FiHeart className={localLiked ? 'fill-current' : ''} />
              <span>{optimisticLikesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              aria-label="Reply to comment"
            >
              <FiMessageSquare />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reply form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-4 ${indentClass} ml-8`}
          >
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Reply to {comment.author_name}
            </h4>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg">
                <p>
                  Thank you for your reply! It will be visible after approval.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`reply-name-${comment.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`reply-name-${comment.id}`}
                    value={replyName}
                    onChange={(e) => setReplyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`reply-email-${comment.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id={`reply-email-${comment.id}`}
                    value={replyEmail}
                    onChange={(e) => setReplyEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your email (not published)"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`reply-website-${comment.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website (optional)
                </label>
                <input
                  type="url"
                  id={`reply-website-${comment.id}`}
                  value={replyWebsite}
                  onChange={(e) => setReplyWebsite(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor={`reply-content-${comment.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`reply-content-${comment.id}`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Your reply"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render replies */}
      {replies.length > 0 && (
        <div className={`space-y-4 ${indentClass} ml-8`}>
          {replies.map((reply) => {
            // Check if this reply is liked by getting it from the parent's likedComments
            // We need to use the same mechanism as the parent component
            let isReplyLiked = false;
            try {
              const storedLikedComments = localStorage.getItem(`likedComments_${postId}`);
              if (storedLikedComments) {
                const likedComments = JSON.parse(storedLikedComments);
                isReplyLiked = Array.isArray(likedComments) && likedComments.includes(reply.id);
              }
            } catch (error) {
              console.error('Error parsing liked comments for reply:', error);
              // Default to not liked if there's an error
              isReplyLiked = false;
            }

            return (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]} // Assuming we only support one level of nesting for now
                level={level + 1}
                postId={postId}
                isLiked={isReplyLiked}
                onLikeToggle={onLikeToggle}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default CommentItem;
