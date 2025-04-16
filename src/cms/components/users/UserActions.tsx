import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
}

interface UserActionsProps {
  user: User;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({ user, onEditUser, onDeleteUser }) => (
  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    <button
      type="button"
      onClick={() => onEditUser(user.id)}
      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
      aria-label={`Edit user ${user.email}`}
      title="Edit user"
    >
      <span className="sr-only">Edit user</span>
      <PencilIcon className="h-5 w-5" />
    </button>
    <button
      type="button"
      onClick={() => onDeleteUser(user.id)}
      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
      aria-label={`Delete user ${user.email}`}
      title="Delete user"
    >
      <span className="sr-only">Delete user</span>
      <TrashIcon className="h-5 w-5" />
    </button>
  </td>
);

export default UserActions;