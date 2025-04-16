import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Badge, { BadgeColor } from '../../../components/ui/Badge';
import UserActions from './UserActions';
import SortIcon, { SortConfig, SortableField } from './SortIcon';

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

interface UsersListProps {
  users: User[];
  roles: Role[];
  onAddUser: () => void;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const getBadgeColor = (roleName: string): BadgeColor => {
  if (roleName === 'admin') return 'red';
  if (roleName === 'content_editor') return 'blue';
  return 'gray';
};

const UsersList: React.FC<UsersListProps> = ({
  users,
  roles,
  onAddUser,
  onEditUser,
  onDeleteUser,
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
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge
                            key={role.id}
                            color={getBadgeColor(role.name)}
                          >
                            {role.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge color="gray">
                          No Roles
                        </Badge>
                      )}
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
                  <UserActions
                    user={user}
                    onEditUser={onEditUser}
                    onDeleteUser={onDeleteUser}
                  />
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
