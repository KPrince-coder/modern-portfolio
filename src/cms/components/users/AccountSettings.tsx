import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import { PasswordVerificationModal } from './PasswordVerificationModal';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

interface AccountSettingsProps {
  user: User | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [actionType, setActionType] = useState<'profile' | 'password' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { formData: FormData, verificationPassword: string }) => {
      try {
        const { formData, verificationPassword } = data;

        // Verify current password first
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user?.email ?? '',
          password: verificationPassword,
        });

        if (verifyError) {
          throw new Error('Password verification failed. Please try again.');
        }

        // Store old values for audit log
        const oldValues = {
          email: user?.email,
          name: user?.user_metadata?.name,
        };

        // Update user profile
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          email: formData.email,
          data: {
            name: formData.name,
          },
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Log the update for audit purposes
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user?.id,
            action: 'update',
            entity_type: 'user_profile',
            entity_id: user?.id,
            old_values: oldValues,
            new_values: {
              email: formData.email,
              name: formData.name,
            },
          });

        return updateData.user;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      onSuccess();
    },
    onError: (error: Error) => {
      setErrors({
        general: error.message,
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { formData: FormData, verificationPassword: string }) => {
      try {
        const { formData, verificationPassword } = data;

        // Verify current password first
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user?.email ?? '',
          password: verificationPassword,
        });

        if (verifyError) {
          throw new Error('Current password is incorrect. Please try again.');
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Log the password update for audit purposes
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user?.id,
            action: 'update',
            entity_type: 'user_password',
            entity_id: user?.id,
            new_values: {
              password_changed: true,
              timestamp: new Date().toISOString(),
            },
          });

        return true;
      } catch (error) {
        console.error('Error updating password:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: Error) => {
      setErrors({
        general: error.message,
      });
    },
  });

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate profile form
  const validateProfileForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setActionType('profile');
    setShowVerificationModal(true);
  };

  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setActionType('password');
    setShowVerificationModal(true);
  };

  // Handle password verification
  const handlePasswordVerified = async (verificationPassword: string) => {
    setShowVerificationModal(false);

    try {
      if (actionType === 'profile') {
        await updateProfileMutation.mutateAsync({ formData, verificationPassword });
      } else if (actionType === 'password') {
        await updatePasswordMutation.mutateAsync({ formData, verificationPassword });
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Account Settings
        </h2>
      </div>

      {successMessage && (
        <div className="m-6 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {errors.general && (
        <div className="m-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div>
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-md font-medium text-gray-900 dark:text-white">
              Profile Information
            </h3>
          </div>

          <form onSubmit={handleProfileUpdate}>
            {/* Name Field */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
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
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 px-4 py-2 rounded-lg border ${
                    errors.email
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={updateProfileMutation.isPending}
              className="w-full"
            >
              Update Profile
            </Button>
          </form>
        </div>

        {/* Password Settings */}
        <div>
          <div className="flex items-center mb-4">
            <KeyIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-md font-medium text-gray-900 dark:text-white">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordUpdate}>
            {/* New Password Field */}
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    errors.newPassword
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 stroke-2" />
                  ) : (
                    <EyeIcon className="h-5 w-5 stroke-2" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
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
                  placeholder="Confirm your new password"
                />
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
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={updatePasswordMutation.isPending}
              className="w-full"
            >
              Change Password
            </Button>
          </form>
        </div>
      </div>

      {/* Password Verification Modal */}
      <PasswordVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handlePasswordVerified}
        title="Verify Your Password"
        message={
          actionType === 'profile'
            ? 'For security reasons, please enter your current password to update your profile.'
            : 'For security reasons, please enter your current password to change your password.'
        }
      />
    </motion.div>
  );
};

export default AccountSettings;
