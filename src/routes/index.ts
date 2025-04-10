import { lazy } from 'react';

// Lazy-loaded page components
const HomePage = lazy(() => import('../pages/HomePage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'));
const BlogPage = lazy(() => import('../pages/BlogPage'));
const BlogPostPage = lazy(() => import('../pages/BlogPostPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Route configuration
export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<() => JSX.Element>;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
  },
  {
    path: '/projects',
    element: ProjectsPage,
  },
  {
    path: '/projects/:slug',
    element: ProjectDetailPage,
  },
  {
    path: '/blog',
    element: BlogPage,
  },
  {
    path: '/blog/:slug',
    element: BlogPostPage,
  },
  {
    path: '/contact',
    element: ContactPage,
  },
  {
    path: '*',
    element: NotFoundPage,
  },
];

// Navigation links for header
export const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
];

export default routes;
