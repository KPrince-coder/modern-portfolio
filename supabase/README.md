# Portfolio Application Database Schema

This directory contains the database schema and seed data for the portfolio application. The schema is designed with SEO optimization, performance, and best practices in mind.

## Schema Overview

The database schema is organized into the following main components:

1. **Personal Information**: Store details about the portfolio owner
2. **Skills**: Technical and soft skills with categories and proficiency levels
3. **Experience & Education**: Work history and educational background
4. **Projects**: Portfolio projects with detailed information and media
5. **Blog**: Blog posts with categories, tags, and comments
6. **Contact & Social**: Contact messages and social media links
7. **Analytics**: Page views, events, and user interactions
8. **Settings & Configuration**: Site settings, themes, and navigation
9. **Security & Authentication**: User roles and permissions
10. **AI Integration**: AI prompts and generated content

## Migration Files

The migrations are split into multiple files to be applied in sequence:

1. `00001_create_extensions.sql`: Set up PostgreSQL extensions and schema
2. `00002_create_personal_data.sql`: Personal information table
3. `00003_create_skills.sql`: Skills and skill categories tables
4. `00004_create_experience_education.sql`: Work experience, education, and interests tables
5. `00005_create_projects.sql`: Projects, project categories, images, and testimonials tables
6. `00006_create_blog.sql`: Blog posts, categories, tags, and comments tables
7. `00007_create_contact_social.sql`: Contact messages and social links tables
8. `00008_create_analytics.sql`: Analytics tables for tracking user interactions
9. `00009_create_settings.sql`: Settings, themes, and configuration tables
10. `00010_create_security.sql`: Security and authentication tables
11. `00011_create_ai_integration.sql`: AI integration tables
12. `00012_create_rls_policies.sql`: Row Level Security policies

## Applying Migrations to Supabase

### Option 1: Using the Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

### Option 2: Using the Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Go to the SQL Editor
4. Copy and paste each migration file in sequence
5. Run the SQL commands

### Option 3: Using the psql CLI

If you have direct access to the database:

1. Connect to your database:
   ```bash
   psql postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
   ```

2. Run each migration file:
   ```bash
   \i path/to/migration/file.sql
   ```

## Seeding the Database

After applying all migrations, you can seed the database with initial data:

```bash
# Using Supabase CLI
supabase db reset --db-url postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres

# Using psql
psql postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres -f seed.sql
```

## Creating an Admin User

To access the CMS, you need to create an admin user. This involves two steps:

1. Create a user through Supabase Authentication
2. Assign the admin role to the user

### Option 1: Using the Supabase Dashboard

1. Go to your Supabase dashboard (https://app.supabase.io)
2. Select your project
3. Navigate to "Authentication" > "Users"
4. Click "Add User" and create a user with an email and password (e.g., admin@example.com / Admin123!)
5. Copy the UUID of the newly created user
6. Go to "SQL Editor" and run the following query, replacing `your-user-uuid-here` with the actual UUID:

```sql
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (
  'your-user-uuid-here',
  (SELECT id FROM portfolio.roles WHERE name = 'admin')
);
```

### Option 2: Using the Supabase API

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

### Option 3: Using the Admin API (Server-side only)

For server-side applications, you can use the Admin API to create users:

```javascript
// This should only be used in a secure server environment
const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'Admin123!',
  email_confirm: true
});

// Then assign the admin role as shown in Option 2
```

## Schema Design Considerations

### Performance Optimization

- Appropriate indexes on frequently queried columns
- Optimized data types for each column
- Full-text search indexes for content search
- Efficient relationship design to minimize joins

### SEO Optimization

- Dedicated fields for meta titles, descriptions, and keywords
- Support for structured data (JSON-LD)
- URL-friendly slugs for all content types
- Canonical URL storage

### Security

- Row Level Security (RLS) policies for all tables
- Role-based access control
- Audit logging for all changes
- Secure API key management

## Database Diagram

You can generate a database diagram using tools like [dbdiagram.io](https://dbdiagram.io) or [pgAdmin](https://www.pgadmin.org/) by importing the schema.

## Customization

Feel free to modify these migrations to suit your specific needs. The schema is designed to be flexible and extensible.
