import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { PasswordVerificationModal } from './PasswordVerificationModal';

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    name?: string;
  };
  roles: Role[];
}

interface UserFormProps {
  user: User | null;
  roles: Role[];
  isLoading: boolean;
  isEditMode: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  roleIds: string[];
}

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  roleIds?: string;
  general?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  roles,
  isLoading,
  isEditMode,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    roleIds: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      // Fetch the latest roles directly from the database
      const fetchCurrentRoles = async () => {
        try {
          console.log('Fetching current roles for user:', user.id);

          // First try using the check_user_roles function
          const { data: directRoles, error } = await supabase
            .rpc('check_user_roles', { in_user_id: user.id });

          if (error) {
            console.error('Error fetching roles with check_user_roles:', error);
            throw error;
          }

          console.log('Current roles from database:', directRoles);

          // Extract role IDs from the result
          const roleIds = directRoles?.map((role: { role_id: string }) => role.role_id) ?? [];
          console.log('Extracted role IDs:', roleIds);

          // Update form data with the latest roles
          setFormData({
            email: user.email ?? '',
            name: user.user_metadata?.name ?? '',
            password: '',
            confirmPassword: '',
            roleIds: roleIds,
          });
        } catch (error) {
          console.error('Error fetching current roles:', error);

          // Fallback to roles from the user object
          let roleIds: string[] = [];
          try {
            if (user.roles && Array.isArray(user.roles)) {
              roleIds = user.roles.map(role => role.id).filter(id => id);
            }
          } catch (extractError) {
            console.error('Error extracting role IDs:', extractError);
          }

          setFormData({
            email: user.email ?? '',
            name: user.user_metadata?.name ?? '',
            password: '',
            confirmPassword: '',
            roleIds: roleIds,
          });
        }
      };

      fetchCurrentRoles();
    } else {
      setFormData({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        roleIds: [],
      });
    }
  }, [user]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        // Ensure roleIds is an array
        const roleIds = Array.isArray(data.roleIds) ? data.roleIds : [];

        // Call the create_user function with the correct parameter names
        const { data: userData, error: createError } = await supabase
          .rpc('create_user', {
            user_email: data.email,
            user_password: data.password,
            user_name: data.name,
            user_roles: roleIds // Send as direct array
          });

        if (createError) {
          console.error('Error creating user:', createError);
          throw new Error(createError.message);
        }

        if (!userData) {
          throw new Error('Failed to create user. No user data returned.');
        }

        // Log the successful creation for audit purposes
        await supabase
          .from('audit_logs')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action: 'create',
            entity_type: 'user',
            entity_id: userData.id,
            new_values: {
              email: data.email,
              name: data.name,
              roles: roleIds,
            },
          });

        return userData;
      } catch (error) {
        console.error('Error creating user:', error);
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

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { formData: FormData, adminPassword: string }) => {
      try {
        const { formData, adminPassword } = data;
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
          email: user?.email,
          name: user?.user_metadata?.name,
          roles: user?.roles?.map(role => role.id) || [],
        };

        // Ensure roleIds is an array of valid UUIDs
        const roleIds = Array.isArray(formData.roleIds)
          ? formData.roleIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
          : [];

        console.log('Updating user with roles:', roleIds);

        // Update user details first
        const { error: updateError } = await supabase
          .rpc('update_user', {
            in_user_id: user?.id ?? '',
            user_email: formData.email,
            user_password: formData.password || null,
            user_name: formData.name,
            user_roles: [] // Empty array since we'll update roles separately
          });

        if (updateError) {
          console.error('Error updating user details:', updateError);
          throw new Error(`Error updating user details: ${updateError.message}`);
        }

        // Debug role IDs before sending
        console.log('Role IDs before sending:', roleIds);
        console.log('Role IDs type:', typeof roleIds);
        console.log('Is array?', Array.isArray(roleIds));

        // Debug the roles to be assigned
        try {
          const { data: debugData } = await supabase
            .rpc('debug_role_assignment', {
              in_user_id: user?.id ?? '',
              in_role_ids: roleIds
            });
          console.log('Debug role assignment:', debugData);
        } catch (error) {
          console.error('Error debugging role assignment:', error);
        }

        // Use direct database operations for role assignment
        try {
          console.log('Using direct database operations for role assignment');

          // First, delete existing roles
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', user?.id ?? '');

          if (deleteError) {
            console.error('Error deleting existing roles:', deleteError);
            throw deleteError;
          }

          // Then insert the new roles
          if (roleIds.length > 0) {
            const rolesToInsert = roleIds.map(roleId => ({
              user_id: user?.id ?? '',
              role_id: roleId
            }));

            const { error: insertError } = await supabase
              .from('user_roles')
              .insert(rolesToInsert);

            if (insertError) {
              console.error('Error inserting new roles:', insertError);
              throw insertError;
            }

            console.log('Roles assigned successfully via direct database operations');
          } else {
            console.log('No roles to assign');
          }
        } catch (dbError) {
          console.error('Error in direct database operations:', dbError);
          throw new Error(`Error updating user roles: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }

        // Log the update for audit purposes
        const { error: auditError } = await supabase
          .from('audit_logs')
          .insert({
            user_id: currentUser.data.user?.id,
            action: 'update',
            entity_type: 'user',
            entity_id: user?.id,
            old_values: oldValues,
            new_values: {
              email: formData.email,
              name: formData.name,
              roles: roleIds,
              password_changed: !!formData.password,
            },
          });

        if (auditError) {
          console.error('Error logging audit:', auditError);
          // Don't throw error here, just log it
        }

        return true;
      } catch (error) {
        console.error('Error updating user:', error);
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'roleIds') {
      try {
        // Handle multiple select - use selectedOptions instead of options
        const select = e.target as HTMLSelectElement;
        // Safely extract selected values
        const selectedOptions = select.selectedOptions || [];
        const selectedValues = Array.from(selectedOptions)
          .map(option => option.value)
          .filter(value => value); // Filter out empty values

        console.log('Selected role values:', selectedValues);

        // Ensure all values are valid UUIDs
        const validUuids = selectedValues.filter(id =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        );

        console.log('Valid UUIDs:', validUuids);

        setFormData(prev => ({
          ...prev,
          roleIds: validUuids,
        }));
      } catch (error) {
        console.error('Error handling role selection:', error);
        // Fallback to empty array if there's an error
        setFormData(prev => ({
          ...prev,
          roleIds: [],
        }));
      }
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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    // Password validation for new users or when changing password
    if (!isEditMode || formData.password) {
      if (!isEditMode && !formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!isEditMode && !formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Role validation
    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'At least one role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Debug function to log the current state of roleIds
  const debugRoleIds = () => {
    console.log('Current roleIds:', formData.roleIds);
    console.log('Is array?', Array.isArray(formData.roleIds));
    console.log('Length:', formData.roleIds.length);
    console.log('JSON string:', JSON.stringify(formData.roleIds));
    console.log('Type of first element:', formData.roleIds.length > 0 ? typeof formData.roleIds[0] : 'N/A');
    console.log('Valid UUIDs?', formData.roleIds.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)));
    return true; // Always return true to continue with form submission
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Debug roleIds before submission
    debugRoleIds();

    // Ensure roleIds is an array of valid UUIDs
    const safeFormData = {
      ...formData,
      roleIds: Array.isArray(formData.roleIds)
        ? formData.roleIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
        : []
    };

    console.log('After validation - roleIds:', safeFormData.roleIds);

    if (safeFormData.roleIds.length === 0) {
      setErrors({
        ...errors,
        roleIds: 'At least one valid role is required',
        general: 'Please select at least one valid role'
      });
      return;
    }

    if (isEditMode) {
      // For editing users, we need to verify the admin's password first
      setShowVerificationModal(true);
    } else {
      // For new users, we can create directly
      try {
        await createUserMutation.mutateAsync(safeFormData);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  };

  // Handle password verification
  const handlePasswordVerified = async (adminPassword: string) => {
    try {
      // Debug roleIds before update
      console.log('Before update - roleIds:', formData.roleIds);
      console.log('Before update - JSON string:', JSON.stringify(formData.roleIds));
      console.log('Before update - Type of first element:', formData.roleIds.length > 0 ? typeof formData.roleIds[0] : 'N/A');
      console.log('Before update - Valid UUIDs?', formData.roleIds.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)));

      // Ensure roleIds is an array of valid UUIDs
      const safeFormData = {
        ...formData,
        roleIds: Array.isArray(formData.roleIds)
          ? formData.roleIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
          : []
      };

      console.log('After validation - roleIds:', safeFormData.roleIds);

      // Log the exact parameters being sent to the update_user function
      console.log('Sending to update_user:', {
        in_user_id: user?.id,
        user_email: safeFormData.email,
        user_password: safeFormData.password || null,
        user_name: safeFormData.name,
        user_roles: safeFormData.roleIds
      });

      // Debug user roles before update
      try {
        const { data: beforeRoles } = await supabase
          .rpc('debug_user_roles', { in_user_id: user?.id });
        console.log('User roles before update:', beforeRoles);
      } catch (error) {
        console.error('Error debugging user roles before update:', error);
      }

      await updateUserMutation.mutateAsync({ formData: safeFormData, adminPassword });

      // Debug user roles after update
      try {
        const { data: afterRoles } = await supabase
          .rpc('debug_user_roles', { in_user_id: user?.id });
        console.log('User roles after update:', afterRoles);

        // Directly check the user_roles table
        const { data: directRoles } = await supabase
          .rpc('check_user_roles', { in_user_id: user?.id });
        console.log('Direct check of user_roles table:', directRoles);

        // Force a refresh of the users list
        console.log('Role assignment complete');
      } catch (error) {
        console.error('Error debugging user roles after update:', error);
      }

      setShowVerificationModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      // Let the error propagate to the PasswordVerificationModal
      throw error;
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
          {isEditMode ? 'Edit User' : 'Add User'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
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
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEditMode ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                  errors.password
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder={isEditMode ? '••••••••' : 'Minimum 8 characters'}
              />
              {formData.password && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 stroke-2" />
                  ) : (
                    <EyeIcon className="h-5 w-5 stroke-2" />
                  )}
                </button>
              )}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEditMode ? 'Confirm New Password' : 'Confirm Password *'}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                  errors.confirmPassword
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="••••••••"
              />
              {formData.confirmPassword && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 stroke-2" />
                  ) : (
                    <EyeIcon className="h-5 w-5 stroke-2" />
                  )}
                </button>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Roles Field */}
        <div className="mb-6">
          <label htmlFor="roleIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Roles *
          </label>
          <select
            id="roleIds"
            name="roleIds"
            multiple
            value={formData.roleIds || []}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.roleIds
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
            size={Math.min(roles.length, 5)}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} {role.description ? `- ${role.description}` : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Hold Ctrl (or Cmd on Mac) to select multiple roles
          </p>
          {errors.roleIds && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleIds}</p>
          )}
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
            isLoading={createUserMutation.isPending || updateUserMutation.isPending}
          >
            {isEditMode ? 'Update User' : 'Add User'}
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

export default UserForm;
