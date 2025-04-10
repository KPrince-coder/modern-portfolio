# CMS Access and User Management

This document provides detailed instructions for accessing the CMS, creating users, and managing permissions.

## Accessing the CMS

The CMS (Content Management System) is accessible at the `/admin` route of your portfolio application. For example, if your application is running at `https://your-portfolio.com`, the CMS would be accessible at `https://your-portfolio.com/admin`.

## Authentication

The CMS uses Supabase Authentication for secure user management. Only authorized users with appropriate roles can access the CMS.

## User Roles

The system has two predefined roles:

1. **Admin**: Full access to all CMS features, including system settings and user management
2. **Content Editor**: Can manage content but not system settings or users

## Creating the Initial Admin User

Before you can access the CMS, you need to create an admin user. This involves two steps:

1. Create a user through Supabase Authentication
2. Assign the admin role to the user

### Method 1: Using the Supabase Dashboard

1. Go to your Supabase dashboard (https://app.supabase.io)
2. Select your project
3. Navigate to "Authentication" > "Users"
4. Click "Add User" and create a user with an email and password
   - Recommended: Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters
   - Example: admin@example.com / Admin123!
5. Copy the UUID of the newly created user
6. Go to "SQL Editor" and run the following query, replacing `your-user-uuid-here` with the actual UUID:

```sql
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (
  'your-user-uuid-here',
  (SELECT id FROM portfolio.roles WHERE name = 'admin')
);
```

### Method 2: Using the Supabase API

You can also create a user and assign the admin role programmatically:

```javascript
// Create a user
const { data: { user }, error: signUpError } = await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'Admin123!',
});

if (signUpError) {
  console.error('Error creating user:', signUpError);
  return;
}

// Assign admin role
const { error: roleError } = await supabase
  .from('portfolio.user_roles')
  .insert({
    user_id: user.id,
    role_id: '(SELECT id FROM portfolio.roles WHERE name = \'admin\')'
  });

if (roleError) {
  console.error('Error assigning role:', roleError);
}
```

### Method 3: Using the Admin API (Server-side only)

For server-side applications, you can use the Admin API to create users:

```javascript
// This should only be used in a secure server environment
const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'Admin123!',
  email_confirm: true
});

// Then assign the admin role as shown in Method 2
```

## Adding Additional Users

Once you have an admin user, you can add additional users through the CMS:

1. Log in to the CMS as an admin
2. Navigate to "Users" in the sidebar
3. Click "Add User"
4. Enter the user's email and select their role
5. The user will receive an invitation email with instructions to set their password

## Managing User Permissions

As an admin, you can manage user permissions:

1. Log in to the CMS as an admin
2. Navigate to "Users" in the sidebar
3. Click on a user to view their details
4. Change their role or disable their account as needed

## Security Best Practices

1. **Use Strong Passwords**: Ensure all CMS users have strong, unique passwords
2. **Regular Audits**: Periodically review the list of users and their permissions
3. **Principle of Least Privilege**: Assign users the minimum level of access they need
4. **Enable Two-Factor Authentication**: For additional security, enable 2FA for all admin accounts
5. **Monitor Login Attempts**: Check the audit logs regularly for suspicious activity

## Troubleshooting

### Cannot Log In

1. Ensure you're using the correct email and password
2. Check if the user exists in the Supabase Authentication system
3. Verify that the user has a role assigned in the `portfolio.user_roles` table
4. Check the browser console for any error messages

### Permission Denied

1. Verify that the user has the appropriate role for the action they're trying to perform
2. Check the Row Level Security (RLS) policies in the database
3. Look for any error messages in the browser console or server logs

### Session Expired

1. The default session duration is 1 week
2. If your session expires, you'll need to log in again
3. You can adjust the session duration in the Supabase Authentication settings

## Additional Resources

- [Supabase Authentication Documentation](https://supabase.io/docs/guides/auth)
- [Row Level Security in PostgreSQL](https://supabase.io/docs/guides/auth/row-level-security)
- [Managing Users in Supabase](https://supabase.io/docs/reference/javascript/auth-api)
