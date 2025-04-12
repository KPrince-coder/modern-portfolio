import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CMSLayout from './components/CMSLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import MessagesPage from './pages/MessagesPage';
import MediaPage from './pages/MediaPage';
import AIPage from './pages/AIPage';
import BlogPage from './pages/BlogPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Placeholder components for other pages
const SettingsPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Settings</h1><p className="mt-4">Site settings</p></div>;
const UsersPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">Users</h1><p className="mt-4">User management</p></div>;
const NotFoundPage = () => <div className="p-6"><h1 className="text-2xl font-semibold">404 - Not Found</h1><p className="mt-4">The page you're looking for doesn't exist.</p></div>;

const CMSRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route path="/" element={<CMSLayout><DashboardPage /></CMSLayout>} />
      <Route path="dashboard" element={<CMSLayout><DashboardPage /></CMSLayout>} />

      <Route path="projects" element={<CMSLayout><ProjectsPage /></CMSLayout>} />
      <Route path="projects/:id" element={<CMSLayout><ProjectsPage /></CMSLayout>} />
      <Route path="projects/new" element={<CMSLayout><ProjectsPage /></CMSLayout>} />

      <Route path="blog" element={<CMSLayout><BlogPage /></CMSLayout>} />
      <Route path="blog/:id" element={<CMSLayout><BlogPage /></CMSLayout>} />
      <Route path="blog/new" element={<CMSLayout><BlogPage /></CMSLayout>} />

      <Route path="about" element={<CMSLayout><AboutPage /></CMSLayout>} />
      <Route path="messages" element={<CMSLayout><MessagesPage /></CMSLayout>} />
      <Route path="media" element={<CMSLayout><MediaPage /></CMSLayout>} />
      <Route path="ai" element={<CMSLayout><AIPage /></CMSLayout>} />
      <Route path="analytics" element={<CMSLayout><AnalyticsPage /></CMSLayout>} />
      <Route path="analytics/blog/:postId" element={<CMSLayout><AnalyticsPage /></CMSLayout>} />
      <Route path="settings" element={<CMSLayout><SettingsPage /></CMSLayout>} />
      <Route path="users" element={<CMSLayout><UsersPage /></CMSLayout>} />

      <Route path="*" element={<CMSLayout><NotFoundPage /></CMSLayout>} />
    </Routes>
  );
};

export default CMSRoutes;
