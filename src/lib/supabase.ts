import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  image_url?: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  code_url?: string;
  case_study_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  category: string;
  tags: string[];
  author: string;
  read_time: number;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  is_replied: boolean;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

export interface PersonalData {
  id: number;
  name: string;
  title: string;
  bio: string;
  profile_image_url?: string;
  email: string;
  phone?: string;
  location?: string;
  resume_url?: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  icon: string;
  category?: string;
  display_order: number;
}

export interface WorkExperience {
  id: number;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
  technologies: string[];
  display_order: number;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
  display_order: number;
}

export interface Interest {
  id: number;
  name: string;
  icon: string;
  display_order: number;
}

// API functions
export const api = {
  // Projects
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  getProjectBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Blog posts
  getBlogPosts: async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  },

  getBlogPostBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  // Contact messages
  submitContactMessage: async (message: Omit<ContactMessage, 'id' | 'created_at' | 'is_read' | 'is_replied'>) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          ...message,
          is_read: false,
          is_replied: false
        }
      ])
      .select();

    if (error) throw error;
    return data[0] as ContactMessage;
  },

  // Personal data
  getPersonalData: async () => {
    const { data, error } = await supabase
      .from('personal_data')
      .select('*')
      .single();

    if (error) throw error;
    return data as PersonalData;
  },

  // Social links
  getSocialLinks: async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as SocialLink[];
  },

  // Skills
  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Skill[];
  },

  // Work Experience
  getWorkExperience: async () => {
    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as WorkExperience[];
  },

  // Education
  getEducation: async () => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Education[];
  },

  // Interests
  getInterests: async () => {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Interest[];
  },
};

export default supabase;
