import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BlogContentEngagementProps {
  analyticsData: any;
  timeRange: string;
  dateRange: { startDate: string; endDate: string };
}

const BlogContentEngagement: React.FC<BlogContentEngagementProps> = ({
  analyticsData,
  timeRange,
  dateRange,
}) => {
  // Mock data for scroll depth analytics
  const scrollDepthData = {
    labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
    datasets: [
      {
        label: 'Average Scroll Depth',
        data: [100, 85, 65, 45],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Mock data for content interaction
  const contentInteractionData = {
    labels: ['Links', 'Images', 'Videos', 'Code Blocks', 'Downloads'],
    datasets: [
      {
        label: 'Click Rate (%)',
        data: [12, 8, 15, 6, 9],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Mock data for reading time distribution
  const readingTimeData = {
    labels: ['< 1 min', '1-3 min', '3-5 min', '5-10 min', '> 10 min'],
    datasets: [
      {
        label: 'Number of Sessions',
        data: [120, 350, 280, 190, 60],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(99, 102, 241, 0.7)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for content decay over time
  const contentDecayData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'New Posts',
        data: [100, 95, 85, 70, 55, 40, 30, 25],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Evergreen Posts',
        data: [100, 105, 110, 108, 112, 115, 118, 120],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Chart options
  const scrollDepthOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.raw}% of visitors`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage of Visitors',
        },
      },
    },
  };

  const contentInteractionOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.raw}% click rate`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Click Rate (%)',
        },
      },
    },
  };

  const readingTimeOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.raw} sessions`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Sessions',
        },
      },
    },
  };

  const contentDecayOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.raw}% of initial views`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 130,
        title: {
          display: true,
          text: 'Percentage of Initial Views',
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Content Engagement Metrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Read Time */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Read Time</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">4m 12s</p>
              </div>
            </div>
          </div>
          
          {/* Avg. Scroll Depth */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Scroll Depth</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">65%</p>
              </div>
            </div>
          </div>
          
          {/* Interaction Rate */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interaction Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">12.5%</p>
              </div>
            </div>
          </div>
          
          {/* Completion Rate */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">45%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Depth Chart */}
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Scroll Depth Analysis
          </h3>
          <div className="h-80">
            <Line data={scrollDepthData} options={scrollDepthOptions} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Shows how far visitors scroll down your blog posts. Higher percentages indicate more engaging content.
          </p>
        </div>
        
        {/* Content Interaction Chart */}
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Content Element Interaction
          </h3>
          <div className="h-80">
            <Line data={contentInteractionData} options={contentInteractionOptions} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Shows how often visitors interact with different elements in your blog posts.
          </p>
        </div>
        
        {/* Reading Time Distribution */}
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Reading Time Distribution
          </h3>
          <div className="h-80">
            <Line data={readingTimeData} options={readingTimeOptions} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Distribution of time spent by visitors reading your blog posts.
          </p>
        </div>
        
        {/* Content Decay Chart */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Content Performance Over Time
          </h3>
          <div className="h-80">
            <Line data={contentDecayData} options={contentDecayOptions} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Shows how blog post views change over time. Evergreen content maintains or increases views, while other content typically decays.
          </p>
        </div>
      </motion.div>
      
      {/* Content Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Content Optimization Recommendations
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
            <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
              Optimal Content Length
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Your posts with 1,500-2,000 words have 35% higher engagement. Consider aiming for this length for future posts.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 dark:border-green-400">
            <h3 className="text-md font-medium text-green-800 dark:text-green-300 mb-2">
              Media Engagement
            </h3>
            <p className="text-sm text-green-700 dark:text-green-200">
              Posts with 4-6 images have 28% higher scroll depth. Consider adding more visual elements to improve engagement.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
            <h3 className="text-md font-medium text-purple-800 dark:text-purple-300 mb-2">
              Content Structure
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-200">
              Posts with clear headings every 300 words have 42% higher completion rates. Consider breaking up content with more headings.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500 dark:border-yellow-400">
            <h3 className="text-md font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              Interactive Elements
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              Posts with code examples and interactive elements have 53% higher interaction rates. Consider adding more interactive content.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogContentEngagement;
