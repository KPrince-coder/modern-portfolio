-- Enable Row Level Security on all tables
ALTER TABLE portfolio.personal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.project_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.time_on_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.ai_message_templates ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user has a specific role
CREATE OR REPLACE FUNCTION portfolio.has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
    JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = role_name
  ) INTO has_role;
  
  RETURN has_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION portfolio.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN portfolio.has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is a content editor
CREATE OR REPLACE FUNCTION portfolio.is_content_editor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN portfolio.has_role('content_editor') OR portfolio.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is authenticated
CREATE OR REPLACE FUNCTION portfolio.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for public read access to published content
CREATE POLICY "Public can view published personal data" ON portfolio.personal_data
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Public can view skills" ON portfolio.skills
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view skill categories" ON portfolio.skill_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view work experience" ON portfolio.work_experience
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view education" ON portfolio.education
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view interests" ON portfolio.interests
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view project categories" ON portfolio.project_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view published projects" ON portfolio.projects
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view project images" ON portfolio.project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio.projects p
      WHERE p.id = project_id AND p.status = 'published'
    )
  );

CREATE POLICY "Public can view project testimonials" ON portfolio.project_testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio.projects p
      WHERE p.id = project_id AND p.status = 'published'
    )
  );

CREATE POLICY "Public can view blog categories" ON portfolio.blog_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view blog tags" ON portfolio.blog_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view published blog posts" ON portfolio.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view blog post tags" ON portfolio.blog_post_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio.blog_posts p
      WHERE p.id = post_id AND p.status = 'published'
    )
  );

CREATE POLICY "Public can view approved blog comments" ON portfolio.blog_comments
  FOR SELECT USING (
    is_approved = TRUE AND
    EXISTS (
      SELECT 1 FROM portfolio.blog_posts p
      WHERE p.id = post_id AND p.status = 'published'
    )
  );

CREATE POLICY "Public can view social links" ON portfolio.social_links
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view navigation items" ON portfolio.navigation_items
  FOR SELECT USING (requires_auth = FALSE);

-- Create policies for authenticated users with specific roles
CREATE POLICY "Admins can manage all data" ON portfolio.personal_data
  USING (portfolio.is_admin())
  WITH CHECK (portfolio.is_admin());

CREATE POLICY "Content editors can manage personal data" ON portfolio.personal_data
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage skills" ON portfolio.skills
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage skill categories" ON portfolio.skill_categories
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage work experience" ON portfolio.work_experience
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage education" ON portfolio.education
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage interests" ON portfolio.interests
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage project categories" ON portfolio.project_categories
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage projects" ON portfolio.projects
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage project images" ON portfolio.project_images
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage project testimonials" ON portfolio.project_testimonials
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage blog categories" ON portfolio.blog_categories
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage blog tags" ON portfolio.blog_tags
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage blog posts" ON portfolio.blog_posts
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage blog post tags" ON portfolio.blog_post_tags
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage blog comments" ON portfolio.blog_comments
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can view all contact messages" ON portfolio.contact_messages
  FOR SELECT USING (portfolio.is_content_editor());

CREATE POLICY "Content editors can update contact messages" ON portfolio.contact_messages
  FOR UPDATE USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage social links" ON portfolio.social_links
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Admins can manage settings" ON portfolio.settings
  USING (portfolio.is_admin())
  WITH CHECK (portfolio.is_admin());

CREATE POLICY "Admins can manage themes" ON portfolio.themes
  USING (portfolio.is_admin())
  WITH CHECK (portfolio.is_admin());

CREATE POLICY "Content editors can manage navigation items" ON portfolio.navigation_items
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage SEO settings" ON portfolio.seo_settings
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Admins can manage roles" ON portfolio.roles
  USING (portfolio.is_admin())
  WITH CHECK (portfolio.is_admin());

CREATE POLICY "Admins can manage user roles" ON portfolio.user_roles
  USING (portfolio.is_admin())
  WITH CHECK (portfolio.is_admin());

CREATE POLICY "Admins can view audit logs" ON portfolio.audit_logs
  FOR SELECT USING (portfolio.is_admin());

CREATE POLICY "Admins can manage API keys" ON portfolio.api_keys
  USING (portfolio.is_admin())
  WITH CHECK (portfolio.is_admin());

CREATE POLICY "Content editors can manage AI prompts" ON portfolio.ai_prompts
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can view AI generations" ON portfolio.ai_generations
  FOR SELECT USING (portfolio.is_content_editor());

CREATE POLICY "Content editors can create AI generations" ON portfolio.ai_generations
  FOR INSERT WITH CHECK (portfolio.is_content_editor());

CREATE POLICY "Content editors can manage AI message templates" ON portfolio.ai_message_templates
  USING (portfolio.is_content_editor())
  WITH CHECK (portfolio.is_content_editor());

-- Create policies for public insert access to specific tables
CREATE POLICY "Public can submit contact messages" ON portfolio.contact_messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can submit blog comments" ON portfolio.blog_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio.blog_posts p
      WHERE p.id = post_id AND p.status = 'published'
    )
  );

CREATE POLICY "Public can record page views" ON portfolio.page_views
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can record events" ON portfolio.events
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can record time on page" ON portfolio.time_on_page
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can record social shares" ON portfolio.social_shares
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can submit AI feedback" ON portfolio.ai_feedback
  FOR INSERT WITH CHECK (TRUE);

-- Create default admin role
INSERT INTO portfolio.roles (name, description, permissions)
VALUES ('admin', 'Administrator with full access', '{"all": true}');

INSERT INTO portfolio.roles (name, description, permissions)
VALUES ('content_editor', 'Can manage content but not system settings', '{"content": true, "settings": false}');
