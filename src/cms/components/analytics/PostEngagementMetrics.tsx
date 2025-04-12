import React from 'react';
import { motion } from 'framer-motion';
import ScrollDepthChart from './ScrollDepthChart';
import ElementInteractionChart from './ElementInteractionChart';
import ReadingTimeDistribution from './ReadingTimeDistribution';
import EngagementMetricsSummary from './EngagementMetricsSummary';

interface PostEngagementMetricsProps {
  engagement: {
    metrics: {
      avgScrollDepth: number;
      completionRate: number;
      interactionRate: number;
      avgTimeSpent: number;
    };
    scrollDepthDistribution: {
      labels: string[];
      values: number[];
    };
    elementInteractionData: {
      elements: string[];
      interactions: number[];
    };
    readingTimeDistribution: {
      labels: string[];
      values: number[];
    };
  };
}

const PostEngagementMetrics: React.FC<PostEngagementMetricsProps> = ({ engagement }) => {
  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Prepare metrics for summary component
  const metrics = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Avg. Read Time',
      value: formatTime(engagement.metrics.avgTimeSpent),
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      title: 'Avg. Scroll Depth',
      value: `${Math.round(engagement.metrics.avgScrollDepth)}%`,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      title: 'Interaction Rate',
      value: `${Math.round(engagement.metrics.interactionRate)}%`,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Completion Rate',
      value: `${Math.round(engagement.metrics.completionRate)}%`,
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Content Engagement Metrics
        </h2>
        
        {/* Metrics Summary */}
        <EngagementMetricsSummary metrics={metrics} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scroll Depth Chart */}
          {engagement.scrollDepthDistribution.labels.length > 0 && (
            <div className="col-span-1">
              <ScrollDepthChart 
                data={engagement.scrollDepthDistribution} 
                title="Scroll Depth Analysis" 
              />
            </div>
          )}
          
          {/* Element Interaction Chart */}
          {engagement.elementInteractionData.elements.length > 0 && (
            <div className="col-span-1">
              <ElementInteractionChart 
                data={engagement.elementInteractionData} 
                title="Content Element Interaction" 
              />
            </div>
          )}
        </div>
        
        {/* Reading Time Distribution */}
        <div className="mt-6">
          <ReadingTimeDistribution 
            data={engagement.readingTimeDistribution} 
            title="Reading Time Distribution" 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PostEngagementMetrics;
