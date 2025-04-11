import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AIResponseGenerator from './AIResponseGenerator';

// Types
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  ai_response?: string;
  notes?: string;
}

interface MessageDetailProps {
  message: ContactMessage;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ 
  message, 
  onStatusChange, 
  onDelete,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(message.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Update message notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const { error } = await supabase
        .from('portfolio.contact_messages')
        .update({ notes })
        .eq('id', message.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      setIsEditingNotes(false);
    },
  });

  // Save AI response mutation
  const saveAIResponseMutation = useMutation({
    mutationFn: async (aiResponse: string) => {
      const { error } = await supabase
        .from('portfolio.contact_messages')
        .update({ 
          ai_response: aiResponse,
          status: 'replied'
        })
        .eq('id', message.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      setShowAIGenerator(false);
      onStatusChange('replied');
    },
  });

  // Handle saving notes
  const handleSaveNotes = async () => {
    try {
      await updateNotesMutation.mutateAsync(notes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Handle saving AI response
  const handleSaveAIResponse = async (response: string) => {
    try {
      await saveAIResponseMutation.mutateAsync(response);
    } catch (error) {
      console.error('Error saving AI response:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): 'gray' | 'blue' | 'green' | 'purple' => {
    switch (status) {
      case 'unread': return 'blue';
      case 'read': return 'gray';
      case 'replied': return 'green';
      case 'archived': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Message from {message.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(message.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge color={getStatusBadgeColor(message.status)}>
            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
          </Badge>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Sender Info */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">{message.name}</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a 
              href={`mailto:${message.email}`} 
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {message.email}
            </a>
          </div>
        </div>

        {/* Message Content */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message:</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {message.message}
            </p>
          </div>
        </div>

        {/* AI Response */}
        {(message.ai_response || showAIGenerator) && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Response:</h3>
            
            {showAIGenerator ? (
              <AIResponseGenerator
                message={message}
                onSave={handleSaveAIResponse}
                onCancel={() => setShowAIGenerator(false)}
                initialResponse={message.ai_response}
              />
            ) : (
              <>
                {message.ai_response ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {message.ai_response}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</h3>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                {notes ? 'Edit Notes' : 'Add Notes'}
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="Add private notes about this message..."
              />
              <div className="flex justify-end mt-2 space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setNotes(message.notes || '');
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  isLoading={updateNotesMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[80px]">
              {notes ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {notes}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No notes added yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onStatusChange('unread')}
            disabled={message.status === 'unread'}
          >
            Mark as Unread
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onStatusChange('read')}
            disabled={message.status === 'read'}
          >
            Mark as Read
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onStatusChange('archived')}
            disabled={message.status === 'archived'}
          >
            Archive
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAIGenerator(true)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            {message.ai_response ? 'Edit AI Response' : 'Generate AI Response'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            href={`mailto:${message.email}?subject=Re: Your message&body=Hello ${message.name},%0D%0A%0D%0A${message.ai_response ? message.ai_response.replace(/\n/g, '%0D%0A') : ''}`}
            isExternal
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          >
            Reply via Email
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDelete}
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageDetail;
