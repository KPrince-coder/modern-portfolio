import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TagInput from '../common/TagInput';

// Types
interface Interest {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
}

const InterestsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [formData, setFormData] = useState<Omit<Interest, 'id'>>({
    name: '',
    description: '',
    icon: '',
    display_order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [interestTags, setInterestTags] = useState<string[]>([]);

  // Fetch interests
  const {
    data: interests,
    isLoading: interestsLoading,
    error: interestsError,
  } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Interest[];
    },
  });

  // Save interest mutation
  const saveInterestMutation = useMutation({
    mutationFn: async (data: { id?: string; interest: Omit<Interest, 'id'> }) => {
      if (data.id) {
        // Update existing interest
        const { error } = await supabase
          .from('interests')
          .update({
            name: data.interest.name,
            description: data.interest.description,
            icon: data.interest.icon,
            display_order: data.interest.display_order,
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new interest
        const { error } = await supabase
          .from('interests')
          .insert({
            name: data.interest.name,
            description: data.interest.description,
            icon: data.interest.icon,
            display_order: data.interest.display_order,
          });

        if (error) {
          throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      resetForm();
    },
  });

  // Delete interest mutation
  const deleteInterestMutation = useMutation({
    mutationFn: async (interestId: string) => {
      const { error } = await supabase
        .from('interests')
        .delete()
        .eq('id', interestId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
    },
  });

  // Save multiple interests from tags
  const saveInterestTagsMutation = useMutation({
    mutationFn: async (tags: string[]) => {
      const interests = tags.map((tag, index) => ({
        name: tag,
        display_order: (interests?.length || 0) + index,
      }));

      const { error } = await supabase
        .from('interests')
        .insert(interests);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      setInterestTags([]);
    },
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Edit interest
  const handleEditInterest = (interest: Interest) => {
    setEditingInterest(interest);
    setFormData({
      name: interest.name,
      description: interest.description || '',
      icon: interest.icon || '',
      display_order: interest.display_order,
    });
    setErrors({});
  };

  // Reset form
  const resetForm = () => {
    setEditingInterest(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      display_order: 0,
    });
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await saveInterestMutation.mutateAsync({
        id: editingInterest?.id,
        interest: formData,
      });
    } catch (error) {
      console.error('Error saving interest:', error);
    }
  };

  // Handle interest deletion
  const handleDeleteInterest = async (interestId: string) => {
    if (window.confirm('Are you sure you want to delete this interest? This action cannot be undone.')) {
      try {
        await deleteInterestMutation.mutateAsync(interestId);
      } catch (error) {
        console.error('Error deleting interest:', error);
      }
    }
  };

  // Handle saving multiple interests from tags
  const handleSaveInterestTags = async () => {
    if (interestTags.length === 0) {
      return;
    }
    
    try {
      await saveInterestTagsMutation.mutateAsync(interestTags);
    } catch (error) {
      console.error('Error saving interest tags:', error);
    }
  };

  // Loading state
  if (interestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading interests..." />
      </div>
    );
  }

  // Error state
  if (interestsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(interestsError as Error)?.message || 'An error occurred while fetching data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Interests & Hobbies</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interests List */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Interests</h3>
          
          {interests && interests.length > 0 ? (
            <div className="space-y-4">
              {interests.map((interest) => (
                <div 
                  key={interest.id} 
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
                >
                  <div className="flex items-center">
                    {interest.icon && (
                      <div className="flex-shrink-0 h-8 w-8 mr-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <div dangerouslySetInnerHTML={{ __html: interest.icon }} />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {interest.name}
                      </h4>
                      {interest.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {interest.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditInterest(interest)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteInterest(interest.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                No interests found. Add your interests using the form.
              </p>
            </div>
          )}
          
          {/* Quick Add Multiple Interests */}
          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Quick Add Multiple Interests
            </h4>
            <TagInput
              tags={interestTags}
              onChange={setInterestTags}
              placeholder="Add interests and press Enter"
            />
            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveInterestTags}
                disabled={interestTags.length === 0 || saveInterestTagsMutation.isPending}
                isLoading={saveInterestTagsMutation.isPending}
              >
                Add All
              </Button>
            </div>
          </div>
        </div>

        {/* Interest Form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingInterest ? 'Edit Interest' : 'Add New Interest'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interest Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Photography"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="Brief description of this interest (optional)"
              />
            </div>
            
            {/* Icon Field */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon (SVG)
              </label>
              <textarea
                id="icon"
                name="icon"
                value={formData.icon || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm"
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">...</svg>'
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Paste SVG code for an icon (optional)
              </p>
            </div>
            
            {/* Display Order Field */}
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={formData.display_order}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="e.g. 1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lower numbers will be displayed first
              </p>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              {editingInterest && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                isLoading={saveInterestMutation.isPending}
              >
                {editingInterest ? 'Update Interest' : 'Add Interest'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default InterestsManager;
