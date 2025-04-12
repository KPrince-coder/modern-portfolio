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

interface AudienceDemographicsProps {
  deviceData: {
    labels: string[];
    values: number[];
  };
  locationData: {
    labels: string[];
    values: number[];
  };
  visitorTypeData: {
    new: number;
    returning: number;
  };
}

const AudienceDemographics: React.FC<AudienceDemographicsProps> = ({ 
  deviceData,
  locationData,
  visitorTypeData
}) => {
  // Prepare device chart data
  const deviceChartData = {
    labels: deviceData.labels,
    datasets: [
      {
        data: deviceData.values,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
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
    labels: locationData.labels,
    datasets: [
      {
        data: locationData.values,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(107, 114, 128, 0.7)',
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
        data: [visitorTypeData.new, visitorTypeData.returning],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
        {/* Device Distribution */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
            Device Distribution
          </h3>
          <div className="h-64">
            <Pie data={deviceChartData} options={chartOptions} />
          </div>
        </div>
        
        {/* Geographic Distribution */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
            Geographic Distribution
          </h3>
          <div className="h-64">
            <Pie data={locationChartData} options={chartOptions} />
          </div>
        </div>
        
        {/* Visitor Type */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
            New vs. Returning Visitors
          </h3>
          <div className="h-64">
            <Pie data={visitorTypeChartData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
          Audience Insights
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          Understanding your audience demographics helps you tailor your content to their preferences. 
          {deviceData.labels.includes('mobile') && deviceData.values[deviceData.labels.indexOf('mobile')] > 30 && 
            ' Your content has a significant mobile audience, so ensure your blog is optimized for mobile viewing.'}
          {visitorTypeData.new > visitorTypeData.returning && 
            ' You have a high percentage of new visitors, consider adding more calls-to-action to encourage return visits.'}
        </p>
      </div>
    </motion.div>
  );
};

export default AudienceDemographics;
