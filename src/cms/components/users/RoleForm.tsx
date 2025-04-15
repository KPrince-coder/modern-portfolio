import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { PasswordVerificationModal } from './PasswordVerificationModal';

interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  permissions?: string[];
}

interface RoleFormProps {
  role: Role | null;
  isLoading: boolean;
  isEditMode: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  permissions: string[];
}

interface FormErrors {
  name?: string;
  description?: string;
  permissions?: string;
  general?: string;
}

// Available permissions
const availablePermissions = [
  { id: 'create_posts', name: 'Create Posts', description: 'Can create new blog posts' },
  { id: 'edit_posts', name: 'Edit Posts', description: 'Can edit existing blog posts' },
  { id: 'delete_posts', name: 'Delete Posts', description: 'Can delete blog posts' },
  { id: 'manage_comments', name: 'Manage Comments', description: 'Can moderate comments' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can manage users (admin only)' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Can manage roles (admin only)' },
  { id: 'manage_media', name: 'Manage Media', description: 'Can upload and manage media files' },
  { id: 'manage_settings', name: 'Manage Settings', description: 'Can change site settings' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Can view site analytics' },
];

const RoleForm: React.FC<RoleFormProps> = ({
  role,
  isLoading,
  isEditMode,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    permissions: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Initialize form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name ?? '',
        description: role.description ?? '',
        permissions: role.permissions ?? [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [role]);

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        // Insert the new role
        const { data: roleData, error } = await supabase
          .from('roles')
          .insert({
            name: data.name,
            description: data.description,
            permissions: data.permissions,
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (!roleData) {
          throw new Error('Failed to create role. No role data returned.');
        }

        // Log the creation for audit purposes
        const currentUser = await supabase.auth.getUser();
        await supabase
          .from('audit_logs')
          .insert({
            user_id: currentUser.data.user?.id,
            action: 'create',
            entity_type: 'role',
            entity_id: roleData.id,
            new_values: {
              name: data.name,
              description: data.description,
              permissions: data.permissions,
            },
          });

        return roleData;
      } catch (error) {
        console.error('Error creating role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setErrors({
        general: error.message,
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { formData: FormData, adminPassword: string }) => {
      try {
        const { formData, adminPassword } = data;

        // Get current user
        const currentUser = await supabase.auth.getUser();

        // Verify admin password first
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: currentUser.data.user?.email ?? '',
          password: adminPassword,
        });

        if (verifyError) {
          throw new Error('Password verification failed. Please try again.');
        }

        // Store old values for audit log
        const oldValues = {
          name: role?.name,
          description: role?.description,
          permissions: role?.permissions,
        };

        // Update the role
        const { data: roleData, error } = await supabase
          .from('roles')
          .update({
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', role?.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (!roleData) {
          throw new Error('Failed to update role. No role data returned.');
        }

        // Log the update for audit purposes
        await supabase
          .from('audit_logs')
          .insert({
            user_id: currentUser.data.user?.id,
            action: 'update',
            entity_type: 'role',
            entity_id: role?.id,
            old_values: oldValues,
            new_values: {
              name: formData.name,
              description: formData.description,
              permissions: formData.permissions,
            },
          });

        return roleData;
      } catch (error) {
        console.error('Error updating role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setErrors({
        general: error.message,
      });
    },
  });

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'permissions') {
      // Handle multiple select
      const select = e.target as HTMLSelectElement;
      const options = Array.from(select.options);
      const selectedValues = options
        .filter(option => option.selected)
        .map(option => option.value);

      setFormData(prev => ({
        ...prev,
        permissions: selectedValues,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Role name must be at least 3 characters';
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

    if (isEditMode) {
      // For editing roles, we need to verify the admin's password first
      setShowVerificationModal(true);
    } else {
      // For new roles, we can create directly
      try {
        await createRoleMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error creating role:', error);
      }
    }
  };

  // Handle password verification
  const handlePasswordVerified = async (adminPassword: string) => {
    setShowVerificationModal(false);

    try {
      await updateRoleMutation.mutateAsync({ formData, adminPassword });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Role' : 'Add Role'}
        </h2>
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {errors.general && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
          </div>
        )}

        <div className="mb-6">
          {/* Role Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role Name *
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
              placeholder="e.g., Editor, Contributor, etc."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="Describe the purpose of this role"
            />
          </div>

          {/* Permissions Field */}
          <div>
            <label htmlFor="permissions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Permissions
            </label>
            <select
              id="permissions"
              name="permissions"
              multiple
              value={formData.permissions}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              size={Math.min(availablePermissions.length, 8)}
            >
              {availablePermissions.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.name} - {permission.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Hold Ctrl (or Cmd on Mac) to select multiple permissions
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
          >
            {isEditMode ? 'Update Role' : 'Add Role'}
          </Button>
        </div>
      </form>

      {/* Password Verification Modal */}
      <PasswordVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handlePasswordVerified}
        title="Verify Your Password"
        message="For security reasons, please enter your password to continue with this action."
      />
    </motion.div>
  );
};

export default RoleForm;
