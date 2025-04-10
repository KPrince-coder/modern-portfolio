-- Seed file for initial portfolio data

-- Insert personal data
INSERT INTO portfolio.personal_data (
  name, 
  title, 
  bio, 
  email, 
  location, 
  meta_title, 
  meta_description, 
  published
) VALUES (
  'John Doe',
  'Full-Stack Developer & UI/UX Designer',
  'Passionate developer with expertise in creating modern web applications using React, Node.js, and cloud technologies. I specialize in building performant, accessible, and visually appealing digital experiences.',
  'contact@example.com',
  'New York, NY',
  'John Doe - Full-Stack Developer & UI/UX Designer Portfolio',
  'Portfolio of John Doe, a full-stack developer and UI/UX designer specializing in modern web applications and digital experiences.',
  TRUE
);

-- Insert skill categories
INSERT INTO portfolio.skill_categories (name, description, display_order) VALUES
('Frontend Development', 'Skills related to client-side web development', 1),
('Backend Development', 'Skills related to server-side development', 2),
('Design', 'UI/UX and graphic design skills', 3),
('DevOps', 'Skills related to deployment and operations', 4);

-- Insert technical skills
INSERT INTO portfolio.skills (name, description, category_id, level, type, display_order, is_featured) VALUES
('React', 'Building interactive UIs with React and its ecosystem', (SELECT id FROM portfolio.skill_categories WHERE name = 'Frontend Development'), 5, 'technical', 1, TRUE),
('TypeScript', 'Strongly typed programming for JavaScript', (SELECT id FROM portfolio.skill_categories WHERE name = 'Frontend Development'), 4, 'technical', 2, TRUE),
('Tailwind CSS', 'Utility-first CSS framework for rapid UI development', (SELECT id FROM portfolio.skill_categories WHERE name = 'Frontend Development'), 5, 'technical', 3, TRUE),
('Node.js', 'JavaScript runtime for server-side applications', (SELECT id FROM portfolio.skill_categories WHERE name = 'Backend Development'), 4, 'technical', 4, TRUE),
('PostgreSQL', 'Advanced open source database', (SELECT id FROM portfolio.skill_categories WHERE name = 'Backend Development'), 4, 'technical', 5, TRUE),
('Supabase', 'Open source Firebase alternative', (SELECT id FROM portfolio.skill_categories WHERE name = 'Backend Development'), 5, 'technical', 6, TRUE),
('UI/UX Design', 'Creating intuitive and visually appealing interfaces', (SELECT id FROM portfolio.skill_categories WHERE name = 'Design'), 4, 'technical', 7, TRUE),
('Docker', 'Containerization for consistent deployment', (SELECT id FROM portfolio.skill_categories WHERE name = 'DevOps'), 3, 'technical', 8, FALSE);

-- Insert soft skills
INSERT INTO portfolio.skills (name, description, level, type, display_order) VALUES
('Communication', 'Effectively conveying ideas to team members and clients', 5, 'soft', 1),
('Problem Solving', 'Analyzing complex issues and developing innovative solutions', 5, 'soft', 2),
('Teamwork', 'Collaborating effectively with cross-functional teams', 4, 'soft', 3),
('Time Management', 'Prioritizing tasks and managing deadlines efficiently', 4, 'soft', 4),
('Adaptability', 'Quickly learning new technologies and adjusting to changes', 5, 'soft', 5);

-- Insert work experience
INSERT INTO portfolio.work_experience (
  title, 
  company, 
  location, 
  description, 
  start_date, 
  end_date, 
  is_current,
  technologies,
  achievements,
  display_order
) VALUES (
  'Senior Frontend Developer',
  'Tech Innovations Inc.',
  'New York, NY',
  'Led the frontend development team in building modern web applications for enterprise clients.',
  '2020-06-01',
  NULL,
  TRUE,
  ARRAY['React', 'TypeScript', 'GraphQL', 'Tailwind CSS'],
  ARRAY['Reduced page load time by 40% through code optimization', 'Implemented CI/CD pipeline reducing deployment time by 60%', 'Mentored 5 junior developers'],
  1
), (
  'Full-Stack Developer',
  'Digital Solutions LLC',
  'Boston, MA',
  'Developed full-stack applications using React and Node.js for various clients in the finance sector.',
  '2018-03-15',
  '2020-05-30',
  FALSE,
  ARRAY['React', 'Node.js', 'Express', 'MongoDB'],
  ARRAY['Built a financial dashboard used by over 10,000 users', 'Implemented real-time data synchronization', 'Reduced API response time by 30%'],
  2
), (
  'UI/UX Designer',
  'Creative Agency',
  'San Francisco, CA',
  'Designed user interfaces and experiences for web and mobile applications.',
  '2016-07-01',
  '2018-02-28',
  FALSE,
  ARRAY['Figma', 'Adobe XD', 'Sketch', 'Photoshop'],
  ARRAY['Redesigned main product increasing user engagement by 25%', 'Created design system used across all company products', 'Won design award for mobile app interface'],
  3
);

-- Insert education
INSERT INTO portfolio.education (
  institution, 
  degree, 
  field_of_study, 
  location, 
  description, 
  start_date, 
  end_date, 
  is_current,
  achievements,
  display_order
) VALUES (
  'University of Technology',
  'Master of Science',
  'Computer Science',
  'New York, NY',
  'Specialized in Human-Computer Interaction and Machine Learning',
  '2014-09-01',
  '2016-05-30',
  FALSE,
  ARRAY['Graduated with honors', 'Published research paper on UI optimization', 'Teaching assistant for Web Development course'],
  1
), (
  'State University',
  'Bachelor of Science',
  'Software Engineering',
  'Boston, MA',
  'Focus on software development methodologies and practices',
  '2010-09-01',
  '2014-05-30',
  FALSE,
  ARRAY['Dean\'s List all semesters', 'Led student software development club', 'Developed campus event management system'],
  2
);

-- Insert interests
INSERT INTO portfolio.interests (name, description, display_order) VALUES
('Open Source', 'Contributing to and maintaining open source projects', 1),
('AI & Machine Learning', 'Exploring applications of AI in web development', 2),
('Photography', 'Capturing landscapes and urban environments', 3),
('Hiking', 'Exploring nature trails and mountains', 4),
('Reading', 'Science fiction and technical books', 5);

-- Insert project categories
INSERT INTO portfolio.project_categories (name, description, slug, display_order) VALUES
('Web Applications', 'Full-stack web applications', 'web-applications', 1),
('Mobile Apps', 'iOS and Android applications', 'mobile-apps', 2),
('UI/UX Design', 'User interface and experience design projects', 'ui-ux-design', 3),
('Open Source', 'Contributions to open source projects', 'open-source', 4);

-- Insert projects
INSERT INTO portfolio.projects (
  title,
  slug,
  description,
  content,
  summary,
  category_id,
  technologies,
  demo_url,
  code_url,
  is_featured,
  status,
  published_at,
  display_order
) VALUES (
  'E-commerce Platform',
  'ecommerce-platform',
  'A full-featured e-commerce platform with product management, cart functionality, and payment processing.',
  '# E-commerce Platform

## Overview
This project is a modern e-commerce platform built with React, Node.js, and PostgreSQL. It features a responsive design, real-time inventory updates, and secure payment processing.

## Features
- Product catalog with categories and filters
- User authentication and profiles
- Shopping cart and wishlist functionality
- Secure checkout with Stripe integration
- Admin dashboard for inventory management
- Order tracking and history
- Responsive design for all devices

## Technical Details
The frontend is built with React and uses Redux for state management. The backend is a Node.js API with Express, connected to a PostgreSQL database. The application is containerized with Docker and deployed on AWS.

## Challenges and Solutions
One of the main challenges was implementing real-time inventory updates. This was solved by using WebSockets to push updates to all connected clients when inventory changes occur.

## Results
The platform has processed over 1,000 orders in its first month, with an average conversion rate of 3.2%, which is 0.8% higher than the industry average.',
  'A modern e-commerce solution with real-time inventory and secure payments.',
  (SELECT id FROM portfolio.project_categories WHERE name = 'Web Applications'),
  ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Docker'],
  'https://example-ecommerce.com',
  'https://github.com/johndoe/ecommerce-platform',
  TRUE,
  'published',
  '2023-01-15',
  1
), (
  'AI-Powered Content Generator',
  'ai-content-generator',
  'A tool that uses AI to generate blog posts, social media content, and marketing copy.',
  '# AI-Powered Content Generator

## Overview
This application leverages the power of AI to help content creators generate high-quality blog posts, social media content, and marketing copy with minimal input.

## Features
- Blog post generation from simple prompts
- Social media post creation with image suggestions
- Marketing copy tailored to specific audiences
- Content editing and refinement tools
- Export to various formats (Markdown, HTML, etc.)
- User content library and history

## Technical Details
The frontend is built with React and TypeScript. The backend uses Node.js with Express and integrates with the OpenAI API for content generation. User data is stored in a PostgreSQL database.

## Challenges and Solutions
The main challenge was ensuring the generated content was unique and tailored to each user\'s brand voice. This was addressed by implementing a fine-tuning system that learns from user edits and preferences over time.

## Results
Users report saving an average of 5 hours per week on content creation, with 85% of generated content requiring minimal editing before publication.',
  'AI tool for generating high-quality content for blogs, social media, and marketing.',
  (SELECT id FROM portfolio.project_categories WHERE name = 'Web Applications'),
  ARRAY['React', 'TypeScript', 'Node.js', 'OpenAI API', 'PostgreSQL'],
  'https://ai-content-gen.example.com',
  'https://github.com/johndoe/ai-content-generator',
  TRUE,
  'published',
  '2023-03-20',
  2
), (
  'Health & Fitness Mobile App',
  'health-fitness-app',
  'A mobile application for tracking workouts, nutrition, and health metrics with personalized recommendations.',
  '# Health & Fitness Mobile App

## Overview
This cross-platform mobile application helps users track their fitness journey, including workouts, nutrition, and health metrics, while providing personalized recommendations.

## Features
- Workout tracking with custom routines
- Nutrition logging and meal planning
- Health metrics monitoring (weight, sleep, etc.)
- Personalized recommendations based on goals
- Social features for motivation and accountability
- Integration with fitness wearables

## Technical Details
The app is built with React Native for cross-platform compatibility. It uses Redux for state management and Firebase for backend services. Health data is synchronized with Apple Health and Google Fit.

## Challenges and Solutions
Creating accurate personalized recommendations was challenging. We implemented a machine learning model that analyzes user data and progress to provide increasingly accurate suggestions over time.

## Results
The app has over 50,000 active users with a 4.7-star average rating across app stores. User retention after 30 days is 68%, significantly above the industry average.',
  'Mobile app for fitness tracking with personalized recommendations and social features.',
  (SELECT id FROM portfolio.project_categories WHERE name = 'Mobile Apps'),
  ARRAY['React Native', 'Redux', 'Firebase', 'Machine Learning', 'Apple Health API'],
  'https://health-app.example.com',
  'https://github.com/johndoe/health-fitness-app',
  FALSE,
  'published',
  '2022-11-10',
  3
);

-- Insert project images
INSERT INTO portfolio.project_images (
  project_id,
  image_url,
  alt_text,
  caption,
  display_order
) VALUES (
  (SELECT id FROM portfolio.projects WHERE slug = 'ecommerce-platform'),
  'https://example.com/images/ecommerce-dashboard.jpg',
  'E-commerce platform dashboard showing sales analytics',
  'Admin dashboard with real-time sales analytics',
  1
), (
  (SELECT id FROM portfolio.projects WHERE slug = 'ecommerce-platform'),
  'https://example.com/images/ecommerce-product-page.jpg',
  'Product detail page with add to cart functionality',
  'Product detail page with dynamic inventory updates',
  2
), (
  (SELECT id FROM portfolio.projects WHERE slug = 'ai-content-generator'),
  'https://example.com/images/ai-generator-interface.jpg',
  'AI content generator interface showing prompt input and generated content',
  'Main interface for content generation',
  1
), (
  (SELECT id FROM portfolio.projects WHERE slug = 'health-fitness-app'),
  'https://example.com/images/fitness-app-dashboard.jpg',
  'Mobile app dashboard showing fitness metrics and progress',
  'User dashboard with weekly progress visualization',
  1
);

-- Insert project testimonials
INSERT INTO portfolio.project_testimonials (
  project_id,
  author_name,
  author_title,
  author_company,
  content,
  rating,
  display_order
) VALUES (
  (SELECT id FROM portfolio.projects WHERE slug = 'ecommerce-platform'),
  'Sarah Johnson',
  'CEO',
  'Fashion Boutique Inc.',
  'This e-commerce platform transformed our online business. Sales increased by 45% in the first quarter after launch, and the admin tools save us hours of work every week.',
  5,
  1
), (
  (SELECT id FROM portfolio.projects WHERE slug = 'ai-content-generator'),
  'Michael Chen',
  'Marketing Director',
  'Tech Solutions LLC',
  'The AI content generator has revolutionized our content strategy. We\'re producing twice the content in half the time, and our engagement metrics have improved across all channels.',
  5,
  1
);

-- Insert blog categories
INSERT INTO portfolio.blog_categories (name, description, slug, display_order) VALUES
('Web Development', 'Articles about web development technologies and practices', 'web-development', 1),
('UI/UX Design', 'Insights on user interface and experience design', 'ui-ux-design', 2),
('Career Advice', 'Tips and advice for tech professionals', 'career-advice', 3),
('Technology Trends', 'Analysis of emerging technologies and industry trends', 'technology-trends', 4);

-- Insert blog tags
INSERT INTO portfolio.blog_tags (name, slug) VALUES
('React', 'react'),
('JavaScript', 'javascript'),
('TypeScript', 'typescript'),
('CSS', 'css'),
('Accessibility', 'accessibility'),
('Performance', 'performance'),
('Career Growth', 'career-growth'),
('AI', 'ai'),
('Web3', 'web3'),
('Design Systems', 'design-systems');

-- Insert social links
INSERT INTO portfolio.social_links (platform, url, display_order, is_featured) VALUES
('GitHub', 'https://github.com/johndoe', 1, TRUE),
('LinkedIn', 'https://linkedin.com/in/johndoe', 2, TRUE),
('Twitter', 'https://twitter.com/johndoe', 3, TRUE),
('Dribbble', 'https://dribbble.com/johndoe', 4, FALSE),
('Medium', 'https://medium.com/@johndoe', 5, FALSE);

-- Insert navigation items
INSERT INTO portfolio.navigation_items (label, url, display_order, is_external) VALUES
('Home', '/', 1, FALSE),
('About', '/about', 2, FALSE),
('Projects', '/projects', 3, FALSE),
('Blog', '/blog', 4, FALSE),
('Contact', '/contact', 5, FALSE);

-- Insert settings
INSERT INTO portfolio.settings (key, value, description) VALUES
('site_settings', 
 '{"site_title": "John Doe - Portfolio", "site_description": "Personal portfolio of John Doe, a full-stack developer and UI/UX designer", "contact_email": "contact@example.com", "google_analytics_id": "UA-XXXXXXXXX-X"}',
 'General site settings'
),
('social_sharing', 
 '{"twitter_handle": "@johndoe", "default_image": "https://example.com/images/default-share.jpg", "facebook_app_id": "XXXXXXXXXX"}',
 'Social sharing settings'
),
('theme_settings', 
 '{"primary_color": "#4F46E5", "secondary_color": "#10B981", "font_heading": "Inter", "font_body": "Inter", "font_code": "Fira Code"}',
 'Theme and styling settings'
);

-- Insert SEO settings
INSERT INTO portfolio.seo_settings (
  page_path,
  title,
  description,
  keywords,
  og_image_url,
  canonical_url
) VALUES (
  '/',
  'John Doe - Full-Stack Developer & UI/UX Designer',
  'Portfolio of John Doe, a full-stack developer and UI/UX designer specializing in modern web applications and digital experiences.',
  'web development, UI/UX design, React, Node.js, portfolio',
  'https://example.com/images/home-og.jpg',
  'https://example.com/'
), (
  '/about',
  'About John Doe - Skills & Experience',
  'Learn about John Doe\'s skills, work experience, and education in web development and UI/UX design.',
  'about, skills, experience, education, web developer',
  'https://example.com/images/about-og.jpg',
  'https://example.com/about'
), (
  '/projects',
  'Projects by John Doe - Web & Mobile Applications',
  'Explore John Doe\'s portfolio of web and mobile application projects, including e-commerce, AI tools, and more.',
  'projects, portfolio, web applications, mobile apps, case studies',
  'https://example.com/images/projects-og.jpg',
  'https://example.com/projects'
), (
  '/blog',
  'John Doe\'s Blog - Web Development & Design Insights',
  'Articles and insights on web development, UI/UX design, and technology trends by John Doe.',
  'blog, articles, web development, UI/UX design, technology',
  'https://example.com/images/blog-og.jpg',
  'https://example.com/blog'
), (
  '/contact',
  'Contact John Doe - Let\'s Work Together',
  'Get in touch with John Doe for project inquiries, collaborations, or just to say hello.',
  'contact, hire, freelance, collaboration, web developer',
  'https://example.com/images/contact-og.jpg',
  'https://example.com/contact'
);

-- Insert AI prompts
INSERT INTO portfolio.ai_prompts (
  name,
  description,
  prompt_template,
  prompt_type,
  parameters
) VALUES (
  'Blog Post Generator',
  'Generates a blog post based on a topic and outline',
  'Write a comprehensive blog post about {{topic}} with the following outline: {{outline}}. The tone should be {{tone}} and the target audience is {{audience}}. Include practical examples and code snippets where relevant.',
  'blog_post',
  '{"topic": "Required. The main topic of the blog post", "outline": "Required. A bullet-point outline of the post structure", "tone": "Optional. The writing tone (default: professional)", "audience": "Optional. The target audience (default: developers)"}'
), (
  'Email Response',
  'Generates a professional response to a contact message',
  'Write a professional and friendly response to the following message: {{message}}. The sender\'s name is {{sender_name}}. Sign the email as {{my_name}}.',
  'email_response',
  '{"message": "Required. The original message to respond to", "sender_name": "Required. The name of the person who sent the message", "my_name": "Required. Your name for the signature"}'
);

-- Insert themes
INSERT INTO portfolio.themes (
  name,
  description,
  colors,
  fonts,
  is_active
) VALUES (
  'Default',
  'The default theme with a modern, clean design',
  '{"primary": "#4F46E5", "secondary": "#10B981", "background": "#FFFFFF", "text": "#1F2937", "accent": "#F59E0B", "dark": {"background": "#111827", "text": "#F9FAFB"}}',
  '{"heading": "Inter", "body": "Inter", "code": "Fira Code", "sizes": {"base": "16px", "h1": "2.5rem", "h2": "2rem", "h3": "1.5rem", "h4": "1.25rem"}}',
  TRUE
), (
  'Dark Mode',
  'A dark theme with vibrant accents',
  '{"primary": "#8B5CF6", "secondary": "#10B981", "background": "#111827", "text": "#F9FAFB", "accent": "#F59E0B", "dark": {"background": "#111827", "text": "#F9FAFB"}}',
  '{"heading": "Inter", "body": "Inter", "code": "Fira Code", "sizes": {"base": "16px", "h1": "2.5rem", "h2": "2rem", "h3": "1.5rem", "h4": "1.25rem"}}',
  FALSE
);
