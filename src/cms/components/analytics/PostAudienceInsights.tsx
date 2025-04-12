import React from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PostAudienceInsightsProps {
  audience: {
    deviceDistribution: {
      labels: string[];
      values: number[];
    };
    locationDistribution: {
      labels: string[];
      values: number[];
    };
    newVsReturning: {
      new: number;
      returning: number;
    };
    browserDistribution: Record<string, number>;
  };
}

const PostAudienceInsights: React.FC<PostAudienceInsightsProps> = ({ audience }) => {
  // Prepare device chart data
  const deviceChartData = {
    labels: audience.deviceDistribution.labels,
    datasets: [
      {
        data: audience.deviceDistribution.values,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // Blue
          'rgba(16, 185, 129, 0.7)', // Green
          'rgba(239, 68, 68, 0.7)',  // Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare location chart data
  const locationChartData = {
    labels: audience.locationDistribution.labels,
    datasets: [
      {
        data: audience.locationDistribution.values,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(239, 68, 68, 0.7)',   // Red
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(139, 92, 246, 0.7)',  // Purple
          'rgba(107, 114, 128, 0.7)', // Gray
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare visitor type chart data
  const visitorTypeChartData = {
    labels: ['New Visitors', 'Returning Visitors'],
    datasets: [
      {
        data: [audience.newVsReturning.new, audience.newVsReturning.returning],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // Blue
          'rgba(16, 185, 129, 0.7)', // Green
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare browser chart data
  const browserLabels = Object.keys(audience.browserDistribution);
  const browserValues = Object.values(audience.browserDistribution);
  
  const browserChartData = {
    labels: browserLabels,
    datasets: [
      {
        data: browserValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(239, 68, 68, 0.7)',   // Red
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(139, 92, 246, 0.7)',  // Purple
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      },
    },
  };

  // Calculate total visitors
  const totalVisitors = audience.newVsReturning.new + audience.newVsReturning.returning;

  // Calculate mobile percentage
  const mobileIndex = audience.deviceDistribution.labels.findIndex(label => 
    label.toLowerCase() === 'mobile'
  );
  
  const mobilePercentage = mobileIndex !== -1 
    ? Math.round((audience.deviceDistribution.values[mobileIndex] / 
        audience.deviceDistribution.values.reduce((a, b) => a + b, 0)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Audience Demographics
      </h2>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visitors</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalVisitors}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Users</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{mobilePercentage}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Location</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {audience.locationDistribution.labels.length > 0 
                  ? audience.locationDistribution.labels[0] 
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Device Distribution */}
        {audience.deviceDistribution.labels.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
              Device Distribution
            </h3>
            <div className="h-64">
              <Pie data={deviceChartData} options={chartOptions} />
            </div>
          </div>
        )}
        
        {/* Geographic Distribution */}
        {audience.locationDistribution.labels.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
              Geographic Distribution
            </h3>
            <div className="h-64">
              <Pie data={locationChartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visitor Type */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
            New vs. Returning Visitors
          </h3>
          <div className="h-64">
            <Pie data={visitorTypeChartData} options={chartOptions} />
          </div>
        </div>
        
        {/* Browser Distribution */}
        {browserLabels.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
              Browser Distribution
            </h3>
            <div className="h-64">
              <Pie data={browserChartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
      
      {/* Audience insights */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
          Audience Insights
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          {mobilePercentage > 40 
            ? `${mobilePercentage}% of your readers are on mobile devices. Ensure your content is mobile-friendly with appropriate font sizes and image scaling.` 
            : 'Most of your readers are on desktop devices. You can use more complex layouts and interactive elements.'}
          {' '}
          {audience.newVsReturning.new > audience.newVsReturning.returning 
            ? 'You have a high percentage of new visitors. Consider adding more calls-to-action to encourage return visits.' 
            : 'You have a good percentage of returning visitors, indicating strong content engagement.'}
        </p>
      </div>
    </motion.div>
  );
};

export default PostAudienceInsights;
