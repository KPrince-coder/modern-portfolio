import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CMSLayout from './components/CMSLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Placeholder components for other pages
const ProjectsPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Projects</h1><p className="mt-4">Projects management page</p></div>;
const BlogPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Blog</h1><p className="mt-4">Blog management page</p></div>;
const AboutPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">About</h1><p className="mt-4">About page content management</p></div>;
const MessagesPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Messages</h1><p className="mt-4">Contact messages</p></div>;
const MediaPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Media</h1><p className="mt-4">Media library</p></div>;
const AIPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">AI Assistant</h1><p className="mt-4">AI content generation</p></div>;
const AnalyticsPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Analytics</h1><p className="mt-4">Site analytics</p></div>;
const SettingsPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Settings</h1><p className="mt-4">Site settings</p></div>;
const UsersPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Users</h1><p className="mt-4">User management</p></div>;
const NotFoundPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">404 - Not Found</h1><p className="mt-4">The page you're looking for doesn't exist.</p></div>;

const CMSRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      
      <Route path="/admin" element={<CMSLayout><DashboardPage /></CMSLayout>} />
      <Route path="/admin/dashboard" element={<CMSLayout><DashboardPage /></CMSLayout>} />
      
      <Route path="/admin/projects" element={<CMSLayout><ProjectsPage /></CMSLayout>} />
      <Route path="/admin/projects/:id" element={<CMSLayout><ProjectsPage /></CMSLayout>} />
      <Route path="/admin/projects/new" element={<CMSLayout><ProjectsPage /></CMSLayout>} />
      
      <Route path="/admin/blog" element={<CMSLayout><BlogPage /></CMSLayout>} />
      <Route path="/admin/blog/:id" element={<CMSLayout><BlogPage /></CMSLayout>} />
      <Route path="/admin/blog/new" element={<CMSLayout><BlogPage /></CMSLayout>} />
      
      <Route path="/admin/about" element={<CMSLayout><AboutPage /></CMSLayout>} />
      <Route path="/admin/messages" element={<CMSLayout><MessagesPage /></CMSLayout>} />
      <Route path="/admin/media" element={<CMSLayout><MediaPage /></CMSLayout>} />
      <Route path="/admin/ai" element={<CMSLayout><AIPage /></CMSLayout>} />
      <Route path="/admin/analytics" element={<CMSLayout><AnalyticsPage /></CMSLayout>} />
      <Route path="/admin/settings" element={<CMSLayout><SettingsPage /></CMSLayout>} />
      <Route path="/admin/users" element={<CMSLayout><UsersPage /></CMSLayout>} />
      
      <Route path="/admin/*" element={<CMSLayout><NotFoundPage /></CMSLayout>} />
    </Routes>
  );
};

export default CMSRoutes;
