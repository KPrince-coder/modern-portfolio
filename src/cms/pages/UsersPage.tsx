import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';

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

  // Fetch users
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      try {
        // Get users from auth.users view (this is a view that exposes auth.users safely)
        const { data: userData, error: userError } = await supabase
          .from('users_view')
          .select(`
            id,
            email,
            created_at,
            last_sign_in_at,
            user_metadata
          `);

        if (userError) {
          throw new Error(userError.message);
        }

        // For each user, get their roles
        const usersWithRoles = await Promise.all(
          userData.map(async (user) => {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select(`
                role_id,
                roles:role_id(id, name, description)
              `)
              .eq('user_id', user.id);

            if (roleError) {
              console.error('Error fetching roles for user:', roleError);
              return {
                ...user,
                roles: [],
              };
            }

            return {
              ...user,
              roles: roleData.map((r) => r.roles),
            };
          })
        );

        // Filter by search query if provided
        if (searchQuery) {
          return usersWithRoles.filter((user) =>
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.user_metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        return usersWithRoles;
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
        // Get user details from users_view
        const { data: userData, error: userError } = await supabase
          .from('users_view')
          .select(`
            id,
            email,
            created_at,
            last_sign_in_at,
            user_metadata
          `)
          .eq('id', selectedUserId)
          .single();

        if (userError) {
          throw new Error(userError.message);
        }

        // Get user roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            roles:role_id(id, name, description)
          `)
          .eq('user_id', selectedUserId);

        if (roleError) {
          console.error('Error fetching roles for user:', roleError);
          return {
            ...userData,
            roles: [],
          };
        }

        return {
          ...userData,
          roles: roleData.map((r) => r.roles),
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
        const { data, error } = await supabase
          .rpc('delete_user', {
            user_id: userId
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

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'user') {
        await deleteUserMutation.mutateAsync(itemToDelete.id);
      } else {
        await deleteRoleMutation.mutateAsync(itemToDelete.id);
      }
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error during deletion:', error);
      // Show error in a toast or alert
      alert(error instanceof Error ? error.message : 'An error occurred during deletion');
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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
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
              onEditUser={(userId) => {
                setSelectedUserId(userId);
                setView('edit-user');
              }}
              onDeleteUser={(userId) => {
                setItemToDelete({ id: userId, type: 'user' });
                setShowDeleteConfirm(true);
              }}
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
              onEditRole={(roleId) => {
                setSelectedRoleId(roleId);
                setView('edit-role');
              }}
              onDeleteRole={(roleId) => {
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`Delete ${itemToDelete?.type === 'user' ? 'User' : 'Role'}`}
        message={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default UsersPage;
