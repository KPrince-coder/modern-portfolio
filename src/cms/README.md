# Custom CMS for Portfolio Application

This directory contains a custom CMS implementation for the portfolio application. The CMS is designed to work with the Supabase backend and provides a user-friendly interface for managing all content.

## Directory Structure

- `components/`: Reusable UI components for the CMS
- `hooks/`: Custom React hooks for data fetching and state management
- `pages/`: Page components for different sections of the CMS
- `utils/`: Utility functions and helpers

## Features

- Dashboard with analytics and recent activity
- Content management for all portfolio sections
- Media library for images and files
- SEO optimization tools
- Theme and settings configuration
- User management and permissions
- AI content generation integration

## Getting Started

To access the CMS, navigate to `/admin` in the application. You will need to log in with admin credentials.

## Implementation Details

The CMS is built using the same technology stack as the main application:
- React for the UI
- Tailwind CSS for styling
- React Query for data fetching
- Supabase for backend services

## Security

The CMS is protected by Supabase authentication and Row Level Security policies. Only users with appropriate roles can access the CMS and perform actions based on their permissions.
