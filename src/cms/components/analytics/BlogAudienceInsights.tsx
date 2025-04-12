import React from 'react';
import { motion } from 'framer-motion';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BlogAudienceInsightsProps {
  analyticsData: any;
  timeRange: string;
  dateRange: { startDate: string; endDate: string };
}

const BlogAudienceInsights: React.FC<BlogAudienceInsightsProps> = ({
  analyticsData,
  timeRange,
  dateRange,
}) => {
  // Mock data for geographic distribution
  const geographicData = {
    labels: ['United States', 'United Kingdom', 'Canada', 'Germany', 'India', 'Australia', 'Other'],
    datasets: [
      {
        data: [35, 15, 12, 8, 7, 5, 18],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(109, 40, 217, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(109, 40, 217, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for device distribution
  const deviceData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [45, 48, 7],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for browser distribution
  const browserData = {
    labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'],
    datasets: [
      {
        data: [58, 22, 10, 8, 2],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for new vs. returning visitors
  const visitorTypeData = {
    labels: ['New', 'Returning'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for traffic sources
  const trafficSourceData = {
    labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email', 'Other'],
    datasets: [
      {
        label: 'Traffic Sources',
        data: [42, 25, 18, 8, 5, 2],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Mock data for audience growth over time
  const audienceGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Total Visitors',
        data: [1200, 1350, 1500, 1800, 2100, 2400, 2800, 3200, 3600, 4000, 4500, 5000],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'New Visitors',
        data: [1000, 1100, 1200, 1400, 1600, 1800, 2000, 2300, 2500, 2800, 3100, 3400],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Chart options
  const pieOptions = {
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
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw || 0;
            return `${value}% of traffic`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Visitors',
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
          Audience Demographics & Behavior
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Visitors */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visitors</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">5,432</p>
              </div>
            </div>
          </div>
          
          {/* New Visitors */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New Visitors</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">3,531</p>
              </div>
            </div>
          </div>
          
          {/* Returning Visitors */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Returning Visitors</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">1,901</p>
              </div>
            </div>
          </div>
          
          {/* Avg. Session Duration */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Session Duration</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">3m 45s</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
              Geographic Distribution
            </h3>
            <div className="h-80">
              <Pie data={geographicData} options={pieOptions} />
            </div>
          </div>
          
          {/* Device Distribution */}
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
              Device Distribution
            </h3>
            <div className="h-80">
              <Pie data={deviceData} options={pieOptions} />
            </div>
          </div>
        </div>
        
        {/* Browser Distribution and Visitor Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
              Browser Distribution
            </h3>
            <div className="h-80">
              <Pie data={browserData} options={pieOptions} />
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
              New vs. Returning Visitors
            </h3>
            <div className="h-80">
              <Pie data={visitorTypeData} options={pieOptions} />
            </div>
          </div>
        </div>
        
        {/* Traffic Sources */}
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Traffic Sources
          </h3>
          <div className="h-80">
            <Bar data={trafficSourceData} options={barOptions} />
          </div>
        </div>
        
        {/* Audience Growth */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Audience Growth Over Time
          </h3>
          <div className="h-80">
            <Line data={audienceGrowthData} options={lineOptions} />
          </div>
        </div>
      </motion.div>
      
      {/* Audience Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Audience Insights & Recommendations
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400">
            <h3 className="text-md font-medium text-indigo-800 dark:text-indigo-300 mb-2">
              Geographic Targeting
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-200">
              35% of your audience is from the United States. Consider creating content specifically targeted to this audience or expanding to reach other regions.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 dark:border-green-400">
            <h3 className="text-md font-medium text-green-800 dark:text-green-300 mb-2">
              Device Optimization
            </h3>
            <p className="text-sm text-green-700 dark:text-green-200">
              Mobile traffic accounts for 48% of your audience. Ensure your blog is fully optimized for mobile devices to improve user experience.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
            <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
              Visitor Retention
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              35% of your visitors are returning users. Consider implementing a newsletter or content series to increase this percentage.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
            <h3 className="text-md font-medium text-purple-800 dark:text-purple-300 mb-2">
              Traffic Source Diversification
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-200">
              42% of your traffic comes from organic search. While this is good, consider diversifying by increasing social media and referral traffic.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogAudienceInsights;
