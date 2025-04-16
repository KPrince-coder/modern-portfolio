/**
 * Script to create an admin user for the portfolio CMS
 *
 * This script creates an admin user using the Supabase Auth API
 * and then assigns the admin role using the assign_admin_role function.
 *
 * Usage:
 * 1. Set your Supabase URL and service role key in .env file (or use VITE_ prefixed versions)
 * 2. Run: node scripts/create-admin-user.js
 *
 * Environment variables:
 * VITE_SUPABASE_URL - Your Supabase project URL
 * VITE_SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (not the anon key)
 * ADMIN_EMAIL - Email for the admin user
 * ADMIN_PASSWORD - Password for the admin user
 * ADMIN_NAME - Name for the admin user (optional)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the .env file in the project root
const envPath = resolve(__dirname, '..', '.env');

// Check if .env file exists
if (existsSync(envPath)) {
  console.log(`Found .env file at: ${envPath}`);
  // Load environment variables from .env file
  dotenv.config({ path: envPath });
} else {
  console.warn(`No .env file found at: ${envPath}`);
  console.warn('Using environment variables from process.env or default values');
}

// Debug: Print available environment variables (without sensitive values)
console.log('Environment variables:');
console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '✓ (set)' : '✗ (not set)'}`);
console.log(`VITE_SUPABASE_SERVICE_ROLE_KEY: ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✓ (set)' : '✗ (not set)'}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✓ (set)' : '✗ (not set)'}`);
console.log(`ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✓ (set)' : '✗ (not set)'}`);

// Get environment variables - prioritize VITE_ prefixed versions
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'admin1@test.io';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
const adminName = process.env.ADMIN_NAME || 'Admin User';

// Validate environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Supabase URL and Service Role Key must be set');
  console.error('Please create a .env file in the project root with these variables:');
  console.error('VITE_SUPABASE_URL=your-supabase-url');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('ADMIN_EMAIL=admin@example.com');
  console.error('ADMIN_PASSWORD=your-secure-password');
  console.error('\nAlternatively, you can use the non-prefixed versions:');
  console.error('SUPABASE_URL=your-supabase-url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('\nYou can copy .env.example to .env and fill in the values');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  console.log(`Creating admin user with email: ${adminEmail}`);

  try {
    // Step 1: Create the user with the Auth API
    console.log('Step 1: Creating user with Supabase Auth API...');
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Automatically confirm the email
      user_metadata: {
        name: adminName
      }
    });

    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('User already exists. Proceeding to assign admin role...');

        // Get the user ID
        const { data: userData, error: getUserError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', adminEmail)
          .single();

        if (getUserError) {
          console.error('Error getting existing user:', getUserError);
          return;
        }

        if (!userData) {
          console.error('User exists but could not be found in the database');
          return;
        }

        // Use the existing user ID
        const userId = userData.id;
        console.log(`Found existing user with ID: ${userId}`);

        // Step 2: Assign the admin role
        await assignAdminRole(userId);
      } else {
        console.error('Error creating user:', createError);
        return;
      }
    } else {
      console.log('User created successfully:', data.user);
      const userId = data.user.id;

      // Step 2: Assign the admin role
      await assignAdminRole(userId);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Assign the admin role to a user
 */
async function assignAdminRole(userId) {
  console.log('Step 2: Assigning admin role...');

  try {
    // Use our new assign_admin_role function
    const { data: roleData, error: roleError } = await supabase.rpc('assign_admin_role', {
      in_user_id: userId
    });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      return false;
    }

    console.log('Admin role assigned successfully:', roleData);
    console.log('\nAdmin user created/updated successfully!');
    console.log('--------------------------------');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`User ID: ${userId}`);
    console.log('\nYou can now sign in to the CMS with these credentials.');
    return true;
  } catch (error) {
    console.error('Error in assignAdminRole:', error);
    return false;
  }
}

createAdminUser();
