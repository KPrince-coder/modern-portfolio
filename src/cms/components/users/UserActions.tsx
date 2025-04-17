import React from 'react';
import { PencilIcon, TrashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string | null;
  user_metadata?: {
    name?: string;
  };
  roles: { id: string; name: string; description?: string }[];
}

interface UserActionsProps {
  user: User;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onConfirmEmail: (user: User) => void;
}

const UserActions: React.FC<UserActionsProps> = ({ user, onEditUser, onDeleteUser, onConfirmEmail }) => (
  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    {/* Edit User Button */}
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

    {/* Confirm Email Button - only show if email is not confirmed */}
    {!user.email_confirmed_at && (
      <button
        type="button"
        onClick={() => onConfirmEmail(user)}
        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-4"
        aria-label={`Confirm email for ${user.email}`}
        title="Confirm email"
      >
        <span className="sr-only">Confirm email</span>
        <EnvelopeIcon className="h-5 w-5" />
      </button>
    )}

    {/* Delete User Button */}
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