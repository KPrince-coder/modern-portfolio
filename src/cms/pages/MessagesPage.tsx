import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import MessageDetail from '../components/messages/MessageDetail';

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

const MessagesPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch messages
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ['contactMessages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as ContactMessage[];
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      setSelectedMessage(null);
    },
  });

  // Update message status mutation
  const updateMessageStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }: { messageId: string; status: string }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
    },
  });

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        await deleteMessageMutation.mutateAsync(messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  // Handle message status update
  const handleUpdateStatus = async (messageId: string, status: string) => {
    try {
      await updateMessageStatusMutation.mutateAsync({ messageId, status });
      
      // If we're updating the currently selected message, update it in state too
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (error) {
      console.error('Error updating message status:', error);
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

  // Filter messages based on status and search query
  const filteredMessages = messages?.filter(message => {
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesSearch = 
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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

  // Loading state
  if (authLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading messages..." />
      </div>
    );
  }

  // Error state
  if (messagesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(messagesError as Error)?.message || 'An error occurred while fetching messages.'}
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Messages</h1>
        </motion.div>

        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      statusFilter === 'all'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('unread')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      statusFilter === 'unread'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setStatusFilter('read')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      statusFilter === 'read'
                        ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => setStatusFilter('replied')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      statusFilter === 'replied'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Replied
                  </button>
                  <button
                    onClick={() => setStatusFilter('archived')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      statusFilter === 'archived'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Archived
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredMessages && filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        // If message is unread, mark it as read
                        if (message.status === 'unread') {
                          handleUpdateStatus(message.id, 'read');
                        }
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedMessage?.id === message.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      } ${
                        message.status === 'unread' ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.name}
                        </h3>
                        <Badge color={getStatusBadgeColor(message.status)}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {message.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(message.created_at)}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No messages match your filters'
                        : 'No messages yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <MessageDetail
                  message={selectedMessage}
                  onStatusChange={(status) => handleUpdateStatus(selectedMessage.id, status)}
                  onDelete={() => handleDeleteMessage(selectedMessage.id)}
                  onClose={() => setSelectedMessage(null)}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-64">
                  <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Select a message</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Choose a message from the list to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
