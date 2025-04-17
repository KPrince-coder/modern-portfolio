import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import { UserPlusIcon, MagnifyingGlassIcon, ChevronDownIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Badge, { BadgeColor } from '../../../components/ui/Badge';
import UserActions from './UserActions';
import SortIcon, { SortConfig, SortableField } from './SortIcon';
import { useCMS } from '../../CMSProvider';
import { ConfirmModal } from '../../../components/ui/modals';

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
  email_confirmed_at?: string | null;
  user_metadata?: {
    name?: string;
  };
  roles: Role[];
}

interface UsersListProps {
  users: User[];
  roles: Role[];
  onAddUser: () => void;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onConfirmEmail: (user: User) => void;
  onAssignRole: (userId: string, roleId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Role Dropdown Component
interface RoleDropdownProps {
  roles: Role[];
  userId: string;
  userEmail: string;
  onAssignRole: (userId: string, roleId: string) => void;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({ roles, userId, userEmail, onAssignRole }) => {
  const { user: currentUser } = useCMS();
  const [isOpen, setIsOpen] = useState(false);
  const [showSelfRoleChangeModal, setShowSelfRoleChangeModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if this is the current user
  const isSelf = currentUser?.id === userId;

  // Handle role assignment with self-check
  const handleRoleAssign = (roleId: string, roleName: string) => {
    if (isSelf) {
      // Show modal instead of proceeding with role change
      setShowSelfRoleChangeModal(true);
    } else {
      // Proceed with role assignment for other users
      console.log(`Assigning role ${roleName} (${roleId}) to user ${userEmail} (${userId})`);
      onAssignRole(userId, roleId);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          Assign Role
          <ChevronDownIcon className="ml-1 -mr-1 h-4 w-4" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRoleAssign(role.id, role.name);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  role="menuitem"
                >
                  <span className={`inline-flex items-center px-2 mr-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColorClasses(role.name)}`}>
                    {role.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Self Role Change Modal */}
      <ConfirmModal
        isOpen={showSelfRoleChangeModal}
        title="Cannot Change Your Own Role"
        message={
          <div className="text-center">
            <div className="mb-4">
              <ShieldExclamationIcon className="h-12 w-12 text-yellow-500 mx-auto" />
            </div>
            <p className="mb-2">For security reasons, you cannot change your own role.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please ask another administrator to change your role if needed.
            </p>
          </div>
        }
        confirmLabel="I Understand"
        onConfirm={() => setShowSelfRoleChangeModal(false)}
        onClose={() => setShowSelfRoleChangeModal(false)}
        variant="warning"
      />
    </>
  );
};

// Map to store role name to color associations
const roleColorMap = new Map<string, BadgeColor>([
  ['admin', 'red'],
  ['editor', 'blue'],
  ['viewer', 'green'],
  ['content_editor', 'indigo'],
  ['author', 'purple'],
  ['moderator', 'yellow'],
  ['analyst', 'pink']
]);

// Function to generate a consistent color based on role name
const generateColorFromName = (name: string): BadgeColor => {
  // List of available colors (excluding gray which is our default)
  const availableColors: BadgeColor[] = ['blue', 'green', 'indigo', 'purple', 'pink', 'yellow', 'red'];

  // Generate a hash from the role name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Use the hash to pick a color from the available colors
  const colorIndex = Math.abs(hash) % availableColors.length;
  return availableColors[colorIndex];
};

// Get badge color for a role
const getBadgeColor = (roleName: string): BadgeColor => {
  // If we have a predefined color for this role, use it
  if (roleColorMap.has(roleName)) {
    return roleColorMap.get(roleName)!;
  }

  // Otherwise, generate a color based on the role name
  return generateColorFromName(roleName);
};

// Get badge color classes directly for a role
const getBadgeColorClasses = (roleName: string): string => {
  const color = getBadgeColor(roleName);
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  };
  return colorClasses[color];
};

// Helper function to check if a user's email is confirmed
const isEmailConfirmed = (user: User): boolean => {
  // Check if email_confirmed_at exists and is not null
  return !!user.email_confirmed_at && user.email_confirmed_at !== null;
};

const UsersList: React.FC<UsersListProps> = ({
  users,
  roles,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onConfirmEmail,
  onAssignRole,
  searchQuery,
  setSearchQuery,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    direction: 'desc'
  });

  // Separate function to handle date comparisons
  const compareDates = (dateA: string | undefined, dateB: string | undefined, ascending: boolean): number => {
    if (!dateA && !dateB) return 0;
    if (!dateA) return ascending ? -1 : 1;
    if (!dateB) return ascending ? 1 : -1;

    const comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
    return ascending ? comparison : -comparison;
  };

  // Separate function to handle string comparisons
  const compareStrings = (a: string, b: string, ascending: boolean): number => {
    const comparison = a.localeCompare(b);
    return ascending ? comparison : -comparison;
  };

  // Separate function to sort users
  const getSortedUsers = (users: User[], config: SortConfig): User[] => {
    const { field, direction } = config;
    const ascending = direction === 'asc';

    return [...users].sort((a, b) => {
      switch (field) {
        case 'email':
          return compareStrings(a.email, b.email, ascending);
        case 'created_at':
          return compareDates(a.created_at, b.created_at, ascending);
        case 'last_sign_in_at':
          return compareDates(a.last_sign_in_at, b.last_sign_in_at, ascending);
        default:
          return 0;
      }
    });
  };

  // Separate function to handle sort changes
  const handleSort = (field: SortableField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sorted users
  const sortedUsers = getSortedUsers(users, sortConfig);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Users
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Add User Button */}
          <Button
            variant="primary"
            onClick={onAddUser}
            className="flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  User
                  <SortIcon field="email" currentSort={sortConfig} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Roles
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Created
                  <SortIcon field="created_at" currentSort={sortConfig} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('last_sign_in_at')}
              >
                <div className="flex items-center">
                  Last Login
                  <SortIcon field="last_sign_in_at" currentSort={sortConfig} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.user_metadata?.name ?? 'No Name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {user.roles && user.roles.length > 0 ? (
                          <>
                            {user.roles.map((role) => (
                              <Badge
                                key={role.id}
                                color={getBadgeColor(role.name)}
                              >
                                {role.name}
                              </Badge>
                            ))}
                          </>
                        ) : (
                          <Badge color="gray">
                            No Roles
                          </Badge>
                        )}

                        {/* Role Assignment Dropdown */}
                        <RoleDropdown
                          roles={roles}
                          userId={user.id}
                          userEmail={user.email}
                          onAssignRole={onAssignRole}
                        />


                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.last_sign_in_at
                      ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Use the helper function to check email confirmation status */}
                    {isEmailConfirmed(user) ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Confirmed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                        Unconfirmed
                      </span>
                    )}
                  </td>
                  <UserActions
                    user={user}
                    onEditUser={onEditUser}
                    onDeleteUser={onDeleteUser}
                    onConfirmEmail={onConfirmEmail}
                  />
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
export default UsersList;
