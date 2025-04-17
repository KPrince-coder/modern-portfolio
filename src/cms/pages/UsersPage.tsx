import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Components
import UsersList from '../components/users/UsersList';
import UserForm from '../components/users/UserForm';
import RolesList from '../components/users/RolesList';
import RoleForm from '../components/users/RoleForm';
import AccountSettings from '../components/users/AccountSettings';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/modals';

// Types
type View = 'users' | 'roles' | 'account' | 'add-user' | 'edit-user' | 'add-role' | 'edit-role';

const UsersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, isAdmin, user } = useCMS();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'user' | 'role' } | null>(null);

  // Email confirmation modal state
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [emailConfirmStatus, setEmailConfirmStatus] = useState<'pending' | 'success' | 'already-confirmed' | 'error'>('pending');
  const [userToConfirm, setUserToConfirm] = useState<{ id: string; email: string } | null>(null);

  // Account deletion modal state
  const [showAccountDeletedModal, setShowAccountDeletedModal] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [showRoleAssignedModal, setShowRoleAssignedModal] = useState(false);
  const [roleAssignedUser, setRoleAssignedUser] = useState<string | null>(null);

  // Fetch users
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      try {
        // Use the get_users_with_roles RPC function to get all users with their roles
        // This function should include email_confirmed_at in its return values
        const { data: usersWithRoles, error: usersError } = await supabase
          .rpc('get_users_with_roles');

        // Log the SQL query for debugging
        console.log('SQL query executed:', 'get_users_with_roles');

        if (usersError) {
          console.error('Error fetching users with roles:', usersError);
          throw new Error(usersError.message);
        }

        console.log('Users with roles from RPC:', usersWithRoles);

        // Log raw data to check email_confirmed_at values
        console.log('Raw users data from RPC:', usersWithRoles);
        usersWithRoles.forEach(user => {
          console.log(`User ${user.email} email_confirmed_at:`, user.email_confirmed_at);
        });

        // Transform the data to match our User interface
        const transformedUsers = usersWithRoles.map(user => {
          // Parse the roles JSON array
          const roles = user.roles && Array.isArray(user.roles)
            ? user.roles.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description
              }))
            : [];

          // Create the transformed user object
          const transformedUser = {
            id: user.user_id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            email_confirmed_at: user.email_confirmed_at,
            user_metadata: { name: user.name },
            roles: roles
          };

          // Log the transformed user to check email_confirmed_at
          console.log(`Transformed user ${transformedUser.email} email_confirmed_at:`, transformedUser.email_confirmed_at);

          return transformedUser;
        });

        // Filter by search query if provided
        if (searchQuery) {
          return transformedUsers.filter((user) =>
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.user_metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        return transformedUsers;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users. You may not have the required permissions.');
      }
    },
    enabled: isAuthenticated && !authLoading && isAdmin,
  });

  // Fetch roles
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: isAuthenticated && !authLoading && isAdmin,
  });

  // Fetch selected user
  const {
    data: selectedUser,
    isLoading: selectedUserLoading,
  } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;

      try {
        // Use the get_user_with_roles RPC function to get the user with their roles
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_with_roles', { in_user_id: selectedUserId });

        if (userError) {
          console.error('Error fetching user with roles:', userError);
          throw new Error(userError.message);
        }

        if (!userData || userData.length === 0) {
          throw new Error('User not found');
        }

        // Get the first (and only) user from the result
        const user = userData[0];
        console.log('Selected user with roles from RPC:', user);

        // Parse the roles JSON array
        const roles = user.roles && Array.isArray(user.roles)
          ? user.roles.map(role => ({
              id: role.id,
              name: role.name,
              description: role.description
            }))
          : [];

        // Transform to match our User interface
        return {
          id: user.user_id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: { name: user.name },
          roles: roles
        };
      } catch (error) {
        console.error('Error fetching user details:', error);
        throw new Error('Failed to fetch user details. You may not have the required permissions.');
      }
    },
    enabled: !!selectedUserId && isAuthenticated && !authLoading && isAdmin,
  });

  // Fetch selected role
  const {
    data: selectedRole,
    isLoading: selectedRoleLoading,
  } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: async () => {
      if (!selectedRoleId) return null;

      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', selectedRoleId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!selectedRoleId && isAuthenticated && !authLoading && isAdmin,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        // Instead of directly deleting the user, we'll use a stored procedure
        // that will handle the deletion with proper permissions
        const { error } = await supabase
          .rpc('delete_user', {
            in_user_id: userId
          });

        if (error) {
          throw new Error(error.message);
        }

        // User roles will be automatically deleted due to ON DELETE CASCADE
        return { success: true };
      } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user. You may not have the required permissions.');
      }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Confirm email mutation
  const confirmEmailMutation = useMutation({
    mutationFn: async (user: { id: string; email: string; email_confirmed_at?: string | null }) => {
      try {
        // Check if email is already confirmed
        if (user.email_confirmed_at) {
          setEmailConfirmStatus('already-confirmed');
          return { success: true, alreadyConfirmed: true };
        }

        // Call the confirm_user_email function
        const { error } = await supabase
          .rpc('confirm_user_email', {
            in_user_id: user.id
          });

        if (error) {
          setEmailConfirmStatus('error');
          throw new Error(error.message);
        }

        setEmailConfirmStatus('success');
        return { success: true, alreadyConfirmed: false };
      } catch (error) {
        console.error('Error confirming user email:', error);
        setEmailConfirmStatus('error');
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Modal will show the success message instead of alert
    },
    onError: () => {
      setEmailConfirmStatus('error');
    }
  });

  // Assign admin role mutation
  const assignAdminRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log('Assigning admin role to user:', userId);

        // First try using the assign_admin_role function
        try {
          const { data, error } = await supabase
            .rpc('assign_admin_role', {
              in_user_id: userId
            });

          if (error) {
            throw new Error(error.message);
          }

          console.log('Admin role assigned successfully:', data);
          return { success: true, method: 'assign_admin_role' };
        } catch (error) {
          console.error('Error using assign_admin_role, trying direct insert:', error);

          // If assign_admin_role fails, try direct insert
          // First, get the admin role ID
          const { data: roles, error: rolesError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'admin')
            .limit(1);

          if (rolesError || !roles || roles.length === 0) {
            throw new Error('Could not find admin role');
          }

          const adminRoleId = roles[0].id;

          // Now directly insert the role
          const { data: directInsertData, error: directInsertError } = await supabase
            .rpc('direct_insert_role', {
              in_user_id: userId,
              in_role_id: adminRoleId
            });

          if (directInsertError) {
            throw new Error(directInsertError.message);
          }

          console.log('Admin role assigned successfully via direct insert:', directInsertData);
          return { success: true, method: 'direct_insert_role' };
        }
      } catch (error) {
        console.error('Error assigning admin role:', error);
        throw new Error('Failed to assign admin role. You may not have the required permissions.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      try {
        // Check if role is in use
        const { data: usersWithRole, error: checkError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role_id', roleId);

        if (checkError) {
          throw new Error(checkError.message);
        }

        if (usersWithRole && usersWithRole.length > 0) {
          throw new Error(`Cannot delete role: it is assigned to ${usersWithRole.length} user(s). Remove the role from all users first.`);
        }

        // Delete the role
        const { error } = await supabase
          .from('roles')
          .delete()
          .eq('id', roleId);

        if (error) {
          throw new Error(error.message);
        }

        return { success: true };
      } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Handle assigning admin role to a user
  const handleAssignAdminRole = async (userId: string) => {
    try {
      // Find the user's email for the success message
      const user = users?.find(u => u.id === userId);
      setRoleAssignedUser(user?.email || 'User');

      await assignAdminRoleMutation.mutateAsync(userId);

      // Force a refresh of the users list
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Show success modal instead of alert
      setShowRoleAssignedModal(true);
    } catch (error) {
      console.error('Error assigning admin role:', error);
      setDeleteErrorMessage(error instanceof Error ? error.message : 'An error occurred while assigning the admin role');
    }
  };

  // Handle assigning any role to a user
  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      // Find the user's email and role name for the success message
      const user = users?.find(u => u.id === userId);
      const role = roles?.find(r => r.id === roleId);
      console.log('Found user and role:', { user, role });

      if (!user) {
        console.error('User not found:', userId);
        setDeleteErrorMessage('User not found. Please refresh the page and try again.');
        return;
      }

      if (!role) {
        console.error('Role not found:', roleId);
        setDeleteErrorMessage('Role not found. Please refresh the page and try again.');
        return;
      }

      setRoleAssignedUser(`${user.email || 'User'} (${role.name || 'Role'})`);

      console.log(`Assigning role ${roleId} to user ${userId}`);
      console.log('Available roles:', roles);

      // Use the simplest approach first - direct database operations
      try {
        console.log('Using direct database operations');

        // First, delete existing roles
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting existing roles:', deleteError);
          throw deleteError;
        }

        // Then insert the new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleId
          });

        if (insertError) {
          console.error('Error inserting new role:', insertError);
          throw insertError;
        }

        console.log('Role assigned successfully via direct database operations');
      } catch (dbError) {
        console.error('Error in direct database operations:', dbError);
        setDeleteErrorMessage('Error assigning role. Please try again.');
        return;
      }

      // Try to refresh the user roles cache, but don't fail if it doesn't work
      try {
        await supabase.rpc('refresh_user_roles_cache');
        console.log('User roles cache refreshed after assigning role');
      } catch (error) {
        console.warn('Error refreshing user roles cache, but continuing:', error);
      }

      // Force a refresh of the users list
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Show success modal instead of alert
      setShowRoleAssignedModal(true);
    } catch (error) {
      console.error('Error assigning role:', error);
      setDeleteErrorMessage(error instanceof Error ? error.message : 'An error occurred while assigning the role');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'user') {
        // Check if the user is deleting their own account
        const isDeletingSelf = itemToDelete.id === user?.id;

        // Delete the user
        await deleteUserMutation.mutateAsync(itemToDelete.id);

        // If the user deleted their own account, show confirmation and log them out
        if (isDeletingSelf) {
          // Show the account deleted modal
          setShowAccountDeletedModal(true);
          // Wait a moment to show the modal before logging out
          setTimeout(async () => {
            // Log the user out
            await supabase.auth.signOut();
            // Redirect to login page
            window.location.href = '/admin/login';
          }, 2000); // 2 seconds delay to show the modal
          return; // Exit early to prevent state updates on unmounted component
        }
      } else {
        // Delete the role
        await deleteRoleMutation.mutateAsync(itemToDelete.id);
      }

      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error during deletion:', error);
      // Set error message and show in modal
      setDeleteErrorMessage(error instanceof Error ? error.message : 'An error occurred during deletion');
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Loading state
  if (authLoading || (view === 'users' && usersLoading) || (view === 'roles' && rolesLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Error state
  if ((view === 'users' && usersError) || (view === 'roles' && rolesError)) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700 dark:text-red-300">
              {view === 'users' && usersError ? 'Error loading users' : 'Error loading roles'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not admin state
  if (!isAdmin) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You don't have permission to access this page. Please contact an administrator.
            </p>
          </div>
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
          className="flex flex-col w-full"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">User Management</h1>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={view === 'users' || view === 'add-user' || view === 'edit-user' ? 'primary' : 'secondary'}
              onClick={() => {
                setView('users');
                setSelectedUserId(null);
              }}
            >
              Users
            </Button>
            <Button
              variant={view === 'roles' || view === 'add-role' || view === 'edit-role' ? 'primary' : 'secondary'}
              onClick={() => {
                setView('roles');
                setSelectedRoleId(null);
              }}
            >
              Roles
            </Button>
            <Button
              variant={view === 'account' ? 'primary' : 'secondary'}
              onClick={() => setView('account')}
            >
              My Account
            </Button>
          </div>
        </motion.div>

        <div className="mt-6">
          {/* Users View */}
          {view === 'users' && (
            <UsersList
              users={users || []}
              roles={roles || []}
              onAddUser={() => {
                setSelectedUserId(null);
                setView('add-user');
              }}
              onEditUser={(userId: string) => {
                setSelectedUserId(userId);
                setView('edit-user');
              }}
              onDeleteUser={(userId: string) => {
                setItemToDelete({ id: userId, type: 'user' });
                setShowDeleteConfirm(true);
              }}
              onConfirmEmail={(user) => {
                setUserToConfirm(user);
                setEmailConfirmStatus('pending');
                setShowEmailConfirmModal(true);
                confirmEmailMutation.mutate(user);
              }}
              onAssignAdminRole={handleAssignAdminRole}
              onAssignRole={handleAssignRole}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {/* Add/Edit User View */}
          {(view === 'add-user' || view === 'edit-user') && (
            <UserForm
              user={selectedUser}
              roles={roles || []}
              isLoading={selectedUserLoading}
              isEditMode={view === 'edit-user'}
              onCancel={() => {
                setView('users');
                setSelectedUserId(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['users'] });
                setView('users');
                setSelectedUserId(null);
              }}
            />
          )}

          {/* Roles View */}
          {view === 'roles' && (
            <RolesList
              roles={roles || []}
              onAddRole={() => {
                setSelectedRoleId(null);
                setView('add-role');
              }}
              onEditRole={(roleId: string) => {
                setSelectedRoleId(roleId);
                setView('edit-role');
              }}
              onDeleteRole={(roleId: string) => {
                setItemToDelete({ id: roleId, type: 'role' });
                setShowDeleteConfirm(true);
              }}
            />
          )}

          {/* Add/Edit Role View */}
          {(view === 'add-role' || view === 'edit-role') && (
            <RoleForm
              role={selectedRole}
              isLoading={selectedRoleLoading}
              isEditMode={view === 'edit-role'}
              onCancel={() => {
                setView('roles');
                setSelectedRoleId(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['roles'] });
                setView('roles');
                setSelectedRoleId(null);
              }}
            />
          )}

          {/* Account Settings View */}
          {view === 'account' && (
            <AccountSettings
              user={user}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['users'] });
              }}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`Delete ${itemToDelete?.type === 'user' ? 'User' : 'Role'}`}
        message={
          itemToDelete?.type === 'user' && itemToDelete?.id === user?.id
            ? 'Are you sure you want to delete your own account? You will be logged out immediately. This action cannot be undone.'
            : `Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        variant="danger"
      />

      {/* Email Confirmation Modal */}
      <ConfirmModal
        isOpen={showEmailConfirmModal}
        title="Confirm Email"
        message={
          emailConfirmStatus === 'pending' ?
            `Confirming email for ${userToConfirm?.email}...` :
          emailConfirmStatus === 'success' ?
            `Email for ${userToConfirm?.email} has been confirmed successfully.` :
          emailConfirmStatus === 'already-confirmed' ?
            `Email for ${userToConfirm?.email} is already confirmed.` :
            `Error confirming email for ${userToConfirm?.email}. Please try again.`
        }
        confirmLabel="OK"
        onConfirm={() => {
          setShowEmailConfirmModal(false);
          setUserToConfirm(null);
        }}
        onClose={() => {
          setShowEmailConfirmModal(false);
          setUserToConfirm(null);
        }}
        variant="primary"
        icon={
          emailConfirmStatus === 'pending' ?
            <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg> :
          emailConfirmStatus === 'success' ?
            <CheckCircleIcon className="h-6 w-6 text-green-500" /> :
          emailConfirmStatus === 'already-confirmed' ?
            <EnvelopeIcon className="h-6 w-6 text-blue-500" /> :
            <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
        }
      />

      {/* Account Deleted Modal */}
      <ConfirmModal
        isOpen={showAccountDeletedModal}
        title="Account Deleted"
        message="Your account has been deleted. You will now be logged out."
        confirmLabel="OK"
        onConfirm={() => {}} // No action needed as the timeout will handle logout
        onClose={() => {}} // No close action as we want to force the logout
        variant="primary"
        icon={<ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
      />

      {/* Delete Error Modal */}
      <ConfirmModal
        isOpen={!!deleteErrorMessage}
        title="Error"
        message={deleteErrorMessage || 'An error occurred during deletion'}
        confirmLabel="OK"
        onConfirm={() => setDeleteErrorMessage(null)}
        onClose={() => setDeleteErrorMessage(null)}
        variant="primary"
        icon={<ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
      />

      {/* Role Assigned Success Modal */}
      <ConfirmModal
        isOpen={showRoleAssignedModal}
        title="Role Assigned"
        message={`Role has been successfully assigned to ${roleAssignedUser}.`}
        confirmLabel="OK"
        onConfirm={() => setShowRoleAssignedModal(false)}
        onClose={() => setShowRoleAssignedModal(false)}
        variant="primary"
        icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
      />
    </div>
  );
};

export default UsersPage;
