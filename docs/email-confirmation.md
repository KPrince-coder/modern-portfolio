# Email Confirmation Feature

This document explains how to use the email confirmation feature in the CMS.

## Overview

In many applications, email confirmation is required for users to access certain features. Normally, this is done by sending a confirmation email to the user with a link that they need to click. However, in some cases, you may want to manually confirm a user's email without requiring them to click on a link.

The email confirmation feature allows admins to confirm a user's email directly from the user management interface.

## How It Works

1. The feature adds a new "Confirm Email" button in the user management interface
2. This button is only shown for users whose email has not been confirmed yet
3. When an admin clicks the button, the user's email is immediately confirmed
4. The button disappears after the email is confirmed

## Implementation Details

The feature consists of two main components:

1. A database function (`confirm_user_email`) that updates the `email_confirmed_at` field in the `auth.users` table
2. A UI component that displays the "Confirm Email" button and calls the function

### Database Function

The `confirm_user_email` function is defined as follows:

```sql
CREATE OR REPLACE FUNCTION portfolio.confirm_user_email(
  in_user_id UUID
) RETURNS JSONB AS $$
DECLARE 
  result JSONB;
BEGIN
  -- Check if the current user has permission to manage users
  IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN
    RAISE EXCEPTION 'Permission denied: You do not have permission to manage users';
  END IF;

  -- Update the user's email_confirmed_at field in auth.users
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = in_user_id;

  -- Return success
  result := jsonb_build_object('success', true, 'id', in_user_id);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This function:
1. Checks if the current user has permission to manage users
2. Updates the `email_confirmed_at` field in the `auth.users` table
3. Returns a success message

### UI Component

The UI component is implemented in the `UserActions.tsx` file:

```jsx
{/* Confirm Email Button - only show if email is not confirmed */}
{!user.email_confirmed_at && (
  <button
    type="button"
    onClick={() => onConfirmEmail(user.id)}
    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-4"
    aria-label={`Confirm email for ${user.email}`}
    title="Confirm email"
  >
    <span className="sr-only">Confirm email</span>
    <EnvelopeIcon className="h-5 w-5" />
  </button>
)}
```

This component:
1. Only shows the button if the user's email has not been confirmed yet
2. Calls the `onConfirmEmail` function when clicked, passing the user's ID
3. Uses the `EnvelopeIcon` from Heroicons to display an envelope icon

## Installation

To install the email confirmation feature, you need to apply two migrations:

1. The `confirm_user_email` function migration
2. The `update_users_view` migration to include the `email_confirmed_at` field

You can apply these migrations using the provided scripts:

```bash
# Set up environment variables
export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# First, apply the confirm email function migration
node scripts/apply-confirm-email-migration.js

# Then, update the users view to include the email_confirmed_at field
node scripts/apply-update-users-view-migration.js
```

## Usage

1. Log in to the CMS as an admin
2. Navigate to the Users page
3. For users whose email has not been confirmed yet, you will see a green envelope icon in the Actions column
4. Click the icon to confirm the user's email
5. The icon will disappear after the email is confirmed

## Security Considerations

1. Only users with the `manage_users` permission can confirm emails
2. The `confirm_user_email` function uses `SECURITY DEFINER` to run with elevated privileges
3. The function checks if the current user has the required permission before confirming the email

## Troubleshooting

If you encounter any issues with the email confirmation feature, check the following:

1. Make sure the migrations have been applied correctly
2. Check if the current user has the `manage_users` permission
3. Check the browser console for any error messages
4. Verify that the `email_confirmed_at` field is being properly updated in the database
