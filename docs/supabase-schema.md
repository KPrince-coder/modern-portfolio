# Supabase Schema Documentation

This document outlines the database schema for the Modern Portfolio application using Supabase.

## Tables

### personal_data

Stores basic information about the portfolio owner.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| name | text | Your full name |
| title | text | Your professional title |
| bio | text | Short biography |
| profile_image_url | text | URL to your profile image |
| email | text | Contact email |
| phone | text | Contact phone number (optional) |
| location | text | Your location (optional) |
| resume_url | text | URL to your downloadable CV/resume |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### skills

Stores your professional skills.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| name | text | Skill name |
| description | text | Short description of the skill |
| icon | text | SVG icon or icon name |
| category | text | Skill category (optional) |
| display_order | int4 | Order to display skills |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### work_experience

Stores your work history.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| title | text | Job title |
| company | text | Company name |
| location | text | Job location |
| start_date | text | Start date (formatted string) |
| end_date | text | End date (formatted string) |
| description | text | Job description |
| achievements | text[] | Array of achievements |
| technologies | text[] | Array of technologies used |
| display_order | int4 | Order to display experiences |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### education

Stores your educational background.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| degree | text | Degree name |
| institution | text | School/university name |
| location | text | Institution location |
| start_date | text | Start date (formatted string) |
| end_date | text | End date (formatted string) |
| description | text | Program description |
| achievements | text[] | Array of achievements |
| display_order | int4 | Order to display education |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### interests

Stores your personal interests.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| name | text | Interest name |
| icon | text | SVG icon or icon name |
| display_order | int4 | Order to display interests |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### projects

Stores your portfolio projects.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| title | text | Project title |
| slug | text | URL-friendly identifier |
| description | text | Short project description |
| content | text | Detailed project description |
| image_url | text | Project image URL |
| category | text | Project category |
| technologies | text[] | Array of technologies used |
| demo_url | text | Live demo URL (optional) |
| code_url | text | Source code URL (optional) |
| case_study_url | text | Case study URL (optional) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### blog_posts

Stores blog articles.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| title | text | Post title |
| slug | text | URL-friendly identifier |
| excerpt | text | Short excerpt |
| content | text | Post content (markdown) |
| image_url | text | Featured image URL |
| category | text | Post category |
| tags | text[] | Array of tags |
| author | text | Author name |
| read_time | int4 | Estimated read time in minutes |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### social_links

Stores links to your social media profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| platform | text | Platform name |
| url | text | Profile URL |
| icon | text | SVG icon or icon name |
| display_order | int4 | Order to display links |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### contact_messages

Stores messages from the contact form.

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| name | text | Sender's name |
| email | text | Sender's email |
| subject | text | Message subject |
| message | text | Message content |
| created_at | timestamptz | Creation timestamp |
| is_read | boolean | Whether the message has been read |
| is_replied | boolean | Whether the message has been replied to |

## Row-Level Security (RLS) Policies

For security, implement the following RLS policies:

### Public Access (Read-Only)

Allow public read access to all tables except `contact_messages`:

```sql
CREATE POLICY "Public can view data" ON [table_name]
FOR SELECT USING (true);
```

### Authenticated Access (Read/Write)

Allow authenticated users (you) to read and write to all tables:

```sql
CREATE POLICY "Authenticated users can manage data" ON [table_name]
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

### Contact Messages

For `contact_messages`, allow public users to insert new messages but only authenticated users to view them:

```sql
CREATE POLICY "Public can submit contact messages" ON contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Only authenticated users can view contact messages" ON contact_messages
FOR SELECT USING (auth.role() = 'authenticated');
```

## Setting Up Supabase

1. Create a new Supabase project
2. Create the tables as described above
3. Set up the RLS policies
4. Add your data to the tables
5. Get your Supabase URL and anon key from the project settings
6. Add them to your `.env` file
