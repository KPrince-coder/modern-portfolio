import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Badge from '../../../components/ui/Badge';

// Types
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

interface BlogCommentsListProps {
  comments: BlogComment[];
  postId: string;
  isLoading: boolean;
  onBack: () => void;
}

const BlogCommentsList: React.FC<BlogCommentsListProps> = ({
  comments,
  postId,
  isLoading,
  onBack,
}) => {
  const queryClient = useQueryClient();
  const [selectedComment, setSelectedComment] = useState<BlogComment | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Update comment approval status mutation
  const updateCommentStatusMutation = useMutation({
    mutationFn: async ({ commentId, isApproved }: { commentId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from('portfolio.blog_comments')
        .update({
          is_approved: isApproved,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('portfolio.blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
      setSelectedComment(null);
    },
  });

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      const { error } = await supabase
        .from('portfolio.blog_comments')
        .insert({
          post_id: postId,
          parent_id: parentId,
          author_name: 'Admin',
          author_email: 'admin@example.com',
          content,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
      setReplyContent('');
    },
  });

  // Handle approval toggle
  const handleApprovalToggle = async (commentId: string, currentStatus: boolean) => {
    try {
      await updateCommentStatusMutation.mutateAsync({
        commentId,
        isApproved: !currentStatus,
      });
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        await deleteCommentMutation.mutateAsync(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedComment || !replyContent.trim()) return;
    
    try {
      await addReplyMutation.mutateAsync({
        parentId: selectedComment.id,
        content: replyContent,
      });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Get parent comments
  const parentComments = comments.filter(comment => !comment.parent_id);
  
  // Get child comments for a parent
  const getChildComments = (parentId: string) => {
    return comments.filter(comment => comment.parent_id === parentId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading comments..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={onBack}
          leftIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        >
          Back to Posts
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Comments
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage comments for this blog post
          </p>
        </div>

        <div className="p-6">
          {parentComments.length > 0 ? (
            <div className="space-y-6">
              {parentComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author_name}
                        </h3>
                        <Badge
                          color={comment.is_approved ? 'green' : 'yellow'}
                          className="ml-2"
                        >
                          {comment.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comment.author_email}
                        {comment.author_website && (
                          <span> | <a href={comment.author_website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{comment.author_website}</a></span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprovalToggle(comment.id, comment.is_approved)}
                        className={`text-sm ${
                          comment.is_approved
                            ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300'
                            : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
                        }`}
                      >
                        {comment.is_approved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setSelectedComment(selectedComment?.id === comment.id ? null : comment)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </div>
                  
                  {/* Reply Form */}
                  {selectedComment?.id === comment.id && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reply to {comment.author_name}
                      </h4>
                      <form onSubmit={handleSubmitReply}>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          placeholder="Write your reply..."
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedComment(null);
                              setReplyContent('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={!replyContent.trim()}
                            isLoading={addReplyMutation.isPending}
                          >
                            Submit Reply
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {getChildComments(comment.id).length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-4">
                      {getChildComments(comment.id).map((reply) => (
                        <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {reply.author_name}
                                </h4>
                                {reply.author_name === 'Admin' && (
                                  <Badge color="indigo" className="ml-2">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(reply.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(reply.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No comments yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This post doesn't have any comments yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCommentsList;
