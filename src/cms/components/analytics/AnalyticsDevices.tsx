import React from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Types
interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
}

interface AnalyticsDevicesProps {
  deviceData: DeviceData;
  timeRange: '7d' | '30d' | '90d' | 'all';
}

const AnalyticsDevices: React.FC<AnalyticsDevicesProps> = ({
  deviceData,
  timeRange,
}) => {
  // Format time range for display
  const formatTimeRange = (range: string): string => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return '';
    }
  };

  // Prepare chart data
  const chartData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [deviceData.desktop, deviceData.mobile, deviceData.tablet],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',   // Indigo for Desktop
          'rgba(16, 185, 129, 0.8)',   // Green for Mobile
          'rgba(139, 92, 246, 0.8)',   // Purple for Tablet
        ],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '60%',
  };

  // Generate browser data (mock data)
  const browserData = [
    { name: 'Chrome', percentage: 62 },
    { name: 'Safari', percentage: 18 },
    { name: 'Firefox', percentage: 10 },
    { name: 'Edge', percentage: 8 },
    { name: 'Other', percentage: 2 },
  ];

  // Generate OS data (mock data)
  const osData = [
    { name: 'Windows', percentage: 45 },
    { name: 'macOS', percentage: 30 },
    { name: 'iOS', percentage: 15 },
    { name: 'Android', percentage: 8 },
    { name: 'Linux', percentage: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Devices Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Device Breakdown - {formatTimeRange(timeRange)}
        </h2>
        <div className="h-80 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      </motion.div>

      {/* Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Desktop Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Desktop</h3>
              <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{deviceData.desktop}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Desktop users typically spend more time on your portfolio and view more pages per session.
            </p>
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Avg. Session</p>
                  <p className="font-medium text-gray-900 dark:text-white">3m 42s</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Pages/Session</p>
                  <p className="font-medium text-gray-900 dark:text-white">4.2</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mobile</h3>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{deviceData.mobile}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mobile traffic has increased by 15% compared to the previous period, showing growing mobile engagement.
            </p>
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Avg. Session</p>
                  <p className="font-medium text-gray-900 dark:text-white">1m 58s</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Pages/Session</p>
                  <p className="font-medium text-gray-900 dark:text-white">2.3</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tablet Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tablet</h3>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{deviceData.tablet}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tablet users have the highest conversion rate for downloading your CV and viewing project details.
            </p>
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Avg. Session</p>
                  <p className="font-medium text-gray-900 dark:text-white">2m 45s</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Pages/Session</p>
                  <p className="font-medium text-gray-900 dark:text-white">3.5</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Browser and OS Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Browsers
          </h2>
          <div className="space-y-4">
            {browserData.map((browser, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{browser.name}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{browser.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" 
                    style={{ width: `${browser.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* OS Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Operating Systems
          </h2>
          <div className="space-y-4">
            {osData.map((os, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{os.name}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{os.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${os.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Insights & Recommendations
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Mobile Optimization</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              With {deviceData.mobile}% of traffic coming from mobile devices, ensure your portfolio is fully responsive and optimized for smaller screens.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Browser Compatibility</h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Chrome dominates your browser usage at 62%. Ensure your site works well in Safari (18%) and Firefox (10%) for the best experience across all users.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Performance Optimization</h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              Consider implementing adaptive loading techniques to serve optimized content based on the user's device and connection speed.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDevices;
