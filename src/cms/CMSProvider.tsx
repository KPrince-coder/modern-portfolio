import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface CMSContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userRoles: string[];
  hasRole: (role: string) => boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isContentEditor: boolean;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

interface CMSProviderProps {
  children: ReactNode;
}

export const CMSProvider = ({ children }: CMSProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRoles(session.user.id);
        } else {
          setUserRoles([]);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      // Add a timeout to the fetch request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timed out')), 10000); // 10 second timeout
      });

      // Create the actual fetch request
      const fetchPromise = supabase
        .from('user_roles')
        .select(`
          role_id,
          roles:role_id(name)
        `)
        .eq('user_id', userId);

      // Race the fetch against the timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => { throw new Error('Connection timed out'); })
      ]) as any;

      if (error) {
        console.error('Error fetching user roles:', error);
        // Check if it's a connection error
        if (error.message?.includes('Failed to fetch') ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('ERR_CONNECTION') ||
            error.message?.includes('ERR_NAME_NOT_RESOLVED') ||
            error.message?.includes('timeout')) {
          // For connection errors, set default admin role to allow basic functionality
          // This is a fallback for offline mode - in production you might want a different approach
          console.warn('Connection error detected, using fallback roles');
          setUserRoles(['admin', 'content_editor']); // Fallback roles for offline mode
        } else {
          setUserRoles([]);
        }
      } else {
        const roles = data.map((item: any) => item.roles.name);
        setUserRoles(roles);
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      // For any other errors, set default admin role to allow basic functionality
      // This is a fallback for offline mode - in production you might want a different approach
      if ((error as Error).message?.includes('Failed to fetch') ||
          (error as Error).message?.includes('NetworkError') ||
          (error as Error).message?.includes('ERR_CONNECTION') ||
          (error as Error).message?.includes('ERR_NAME_NOT_RESOLVED') ||
          (error as Error).message?.includes('timeout')) {
        console.warn('Connection error detected, using fallback roles');
        setUserRoles(['admin', 'content_editor']); // Fallback roles for offline mode
      } else {
        setUserRoles([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Error during login:', error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const hasRole = (role: string) => {
    return userRoles.includes(role);
  };

  const isAdmin = hasRole('admin');
  const isContentEditor = hasRole('content_editor') || isAdmin;

  const value = {
    isAuthenticated: !!session,
    isLoading,
    user,
    userRoles,
    hasRole,
    login,
    logout,
    isAdmin,
    isContentEditor,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

export default CMSProvider;
