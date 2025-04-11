import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Badge from '../../../components/ui/Badge';
import SkillForm from './SkillForm';
import SkillCategoryForm from './SkillCategoryForm';

// Types
interface Skill {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category_id?: string;
  level?: number;
  type: 'technical' | 'soft';
  display_order: number;
  years_experience?: number;
  is_featured: boolean;
}

interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
}

type SkillsView = 'list' | 'add' | 'edit' | 'categories';

const SkillsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<SkillsView>('list');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'technical' | 'soft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch skills
  const {
    data: skills,
    isLoading: skillsLoading,
    error: skillsError,
  } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio.skills')
        .select(`
          *,
          category:category_id(id, name)
        `)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as (Skill & { category: { id: string; name: string } | null })[];
    },
  });

  // Fetch skill categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio.skill_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as SkillCategory[];
    },
  });

  // Delete skill mutation
  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('portfolio.skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });

  // Handle skill deletion
  const handleDeleteSkill = async (skillId: string) => {
    if (window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      try {
        await deleteSkillMutation.mutateAsync(skillId);
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  // Filter skills based on search query and filters
  const filteredSkills = skills?.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || skill.type === typeFilter;
    
    const matchesCategory = categoryFilter === 'all' || skill.category_id === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Loading state
  if (skillsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading skills..." />
      </div>
    );
  }

  // Error state
  if (skillsError || categoriesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(skillsError as Error)?.message || (categoriesError as Error)?.message || 'An error occurred while fetching data.'}
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
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skills Management</h2>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedSkill(null);
                  setView('add');
                }}
              >
                Add Skill
              </Button>
              <Button
                variant="secondary"
                onClick={() => setView('categories')}
              >
                Manage Categories
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="Search skills..."
                />
              </div>

              {/* Type Filter */}
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skill Type
                </label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'technical' | 'soft')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical Skills</option>
                  <option value="soft">Soft Skills</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="all">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Skills List */}
          {filteredSkills && filteredSkills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Featured
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSkills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {skill.icon && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <div dangerouslySetInnerHTML={{ __html: skill.icon }} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {skill.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {skill.description.length > 50 
                                ? `${skill.description.substring(0, 50)}...` 
                                : skill.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={skill.type === 'technical' ? 'indigo' : 'purple'}>
                          {skill.type === 'technical' ? 'Technical' : 'Soft Skill'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {skill.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" 
                              style={{ width: `${(skill.level || 0) * 20}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {skill.level || 0}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {skill.is_featured ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Not Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedSkill(skill);
                            setView('edit');
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-md">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No skills found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding a new skill'}
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedSkill(null);
                    setView('add');
                  }}
                >
                  Add Skill
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <SkillForm
          skill={selectedSkill}
          categories={categories || []}
          onCancel={() => setView('list')}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            setView('list');
          }}
        />
      )}

      {view === 'categories' && (
        <SkillCategoryForm
          categories={categories || []}
          onCancel={() => setView('list')}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
          }}
        />
      )}
    </motion.div>
  );
};

export default SkillsManager;
