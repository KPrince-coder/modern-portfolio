# Modern Portfolio

A modern, responsive portfolio website built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Modern Design**: Clean, responsive design with smooth animations
- **Dark Mode**: Toggle between light, dark, and system theme
- **Custom Cursor**: Interactive custom cursor for a unique user experience
- **CMS Integration**: Content managed through Supabase backend
- **Blog**: Integrated blog with categories and tags
- **Projects Showcase**: Display your projects with details and links
- **About Page**: Showcase your skills, experience, education, and interests
- **Contact Form**: Get in touch with potential clients or employers
- **CV Download**: Allow visitors to download your CV

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **State Management**: React Query
- **Backend**: Supabase
- **AI Integration**: Groq API
- **Animations**: Framer Motion
- **Fonts**: Inter (general text) and Fira Code (code blocks)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for backend)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/modern-portfolio.git
   cd modern-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:

   ```markdown
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GROQ_API_KEY=your-groq-api-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deployment

For detailed deployment instructions, see the [Deployment Guide](docs/deployment-guide.md).

If you're deploying to Netlify and encounter "Page not found" errors, see the [Netlify SPA Routing](docs/netlify-spa-routing.md) guide.

For a technical explanation of SPA routing and how to solve routing issues on various platforms, see [SPA Routing Explained](docs/spa-routing-explained.md).

## Supabase Setup

1. Create a new Supabase project
2. Apply the database migrations:

   ```bash
   # Using Supabase CLI
   supabase link --project-ref your-project-ref
   supabase db push
   ```

   Alternatively, you can run the SQL files in the `supabase/migrations` directory manually through the Supabase dashboard.

3. Seed the database with initial data:

   ```bash
   # Using psql
   psql postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres -f supabase/seed.sql
   ```

The database schema includes the following tables:

- `personal_data`: Basic information about you
- `projects`: Your portfolio projects
- `blog_posts`: Blog articles
- `skills`: Your professional skills
- `work_experience`: Your work history
- `education`: Your educational background
- `interests`: Your personal interests
- `social_links`: Links to your social media profiles
- `contact_messages`: Messages from the contact form
- And many more for analytics, SEO, and CMS functionality

Detailed schema information can be found in the `supabase/README.md` file.

### Storage Buckets

The application uses the following Supabase storage buckets for file uploads:

- `profile`: For profile images and resume files
- `projects`: For project thumbnails, gallery images, and videos
- `blog`: For blog featured images, content images, and videos
- `experience`: For company logos and institution logos
- `seo`: For Open Graph images and site icons
- `media`: For general media library assets (images, videos, documents)

Detailed information about storage buckets can be found in the [docs/storage-buckets.md](docs/storage-buckets.md) file.

## Content Management System (CMS)

The portfolio includes a custom CMS for managing all content. The CMS is accessible at `/admin` and requires authentication.

### Features

- Dashboard with analytics and recent activity
- Content management for all portfolio sections
- Media library for images and files
- SEO optimization tools
- Theme and settings configuration
- User management and permissions
- AI content generation integration

### Accessing the CMS

1. Create an admin user (see below)
2. Navigate to `/admin` in your browser
3. Log in with your admin credentials

### Creating an Admin User

Before you can access the CMS, you need to create an admin user:

#### Option 1: Using the provided script

```bash
# Set up environment variables
export SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=Admin123!

# Run the script
node scripts/create-admin-user.js
```

#### Option 2: Using the Supabase Dashboard

1. Go to your Supabase dashboard
2. Create a user in the Authentication section
3. Assign the admin role using SQL

Detailed instructions can be found in [docs/cms-access.md](docs/cms-access.md).

### User Management Features

#### Email Confirmation

Admins can confirm a user's email directly from the user management interface. To apply this feature, run the following scripts:

```bash
# Set up environment variables
export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# First, apply the confirm email function migration
node scripts/apply-confirm-email-migration.js

# Then, update the users view to include the email_confirmed_at field
node scripts/apply-update-users-view-migration.js
```

This adds a new "Confirm Email" button in the user management interface that allows admins to confirm a user's email without requiring the user to click on a confirmation link.

## Customization

### Changing the Theme

You can customize the theme colors by:

1. Editing the theme settings in the Tailwind configuration
2. Using the CMS theme editor (accessible via `/admin/settings`)

### Adding New Pages

1. Create a new page component in the `src/pages` directory
2. Add the route to the page in `src/routes/index.ts`
3. Update the navigation links in the same file if needed
4. Add SEO settings for the page in the CMS

## License

This project is licensed under the MIT License - see the LICENSE file for details.
