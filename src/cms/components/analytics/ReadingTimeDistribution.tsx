import React from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReadingTimeDistributionProps {
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
}

const ReadingTimeDistribution: React.FC<ReadingTimeDistributionProps> = ({ 
  data,
  title = 'Reading Time Distribution'
}) => {
  // Prepare chart data
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Number of Sessions',
        data: data.values,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>
      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Shows the distribution of time spent by visitors reading your blog post.
      </p>
    </motion.div>
  );
};

export default ReadingTimeDistribution;
