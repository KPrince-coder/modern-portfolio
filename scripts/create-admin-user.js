/**
 * Script to create an admin user for the portfolio CMS
 * 
 * Usage:
 * 1. Set your Supabase URL and service role key in .env file
 * 2. Run: node scripts/create-admin-user.js
 * 
 * Environment variables:
 * SUPABASE_URL - Your Supabase project URL
 * SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (not the anon key)
 * ADMIN_EMAIL - Email for the admin user
 * ADMIN_PASSWORD - Password for the admin user
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

// Validate environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  console.log(`Creating admin user with email: ${adminEmail}`);
  
  try {
    // Check if user already exists
    const { data: existingUsers, error: getUserError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', adminEmail);
    
    if (getUserError) {
      console.error('Error checking for existing user:', getUserError);
      return;
    }
    
    let userId;
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('User already exists, using existing user');
      userId = existingUsers[0].id;
    } else {
      // Create new user
      const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });
      
      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return;
      }
      
      console.log('User created successfully');
      userId = user.id;
    }
    
    // Check if user already has admin role
    const { data: existingRoles, error: getRoleError } = await supabase
      .from('portfolio.user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (getRoleError) {
      console.error('Error checking for existing roles:', getRoleError);
      return;
    }
    
    if (existingRoles && existingRoles.length > 0) {
      console.log('User already has roles assigned');
      
      // Check if admin role is already assigned
      const hasAdminRole = existingRoles.some(role => 
        role.role_id === '(SELECT id FROM portfolio.roles WHERE name = \'admin\')');
      
      if (hasAdminRole) {
        console.log('Admin role already assigned to user');
        return;
      }
    }
    
    // Assign admin role
    const { error: roleError } = await supabase
      .from('portfolio.user_roles')
      .insert({
        user_id: userId,
        role_id: '(SELECT id FROM portfolio.roles WHERE name = \'admin\')'
      });
    
    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      return;
    }
    
    console.log('Admin role assigned successfully');
    console.log('\nAdmin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nYou can now log in to the CMS at /admin');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
