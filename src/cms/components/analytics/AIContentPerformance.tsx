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

interface AIPerformanceData {
  metric: string;
  ai_content: number;
  regular_content: number;
  difference_percentage: number;
}

interface AIContentPerformanceProps {
  data: AIPerformanceData[];
}

const AIContentPerformance: React.FC<AIContentPerformanceProps> = ({ data }) => {
  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          AI vs. Manual Content Performance
        </h2>
        <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
          <p>No performance data available. Try again later or check your connection.</p>
        </div>
      </motion.div>
    );
  }

  // Prepare chart data with null checks
  const chartData = {
    labels: data.map(item => item.metric || 'Unknown'),
    datasets: [
      {
        label: 'AI Generated',
        data: data.map(item => item.ai_content || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.7)', // Purple
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Manual Content',
        data: data.map(item => item.regular_content || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const metric = data[context.dataIndex]?.metric || '';

            if (metric && typeof metric === 'string' && metric.includes('Time')) {
              // Format time in minutes and seconds
              const mins = Math.floor(value / 60);
              const secs = Math.floor(value % 60);
              return `${label}: ${mins}m ${secs}s`;
            }

            return `${label}: ${value.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        AI vs. Manual Content Performance
      </h2>
      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div
            key={item.metric}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {item.metric}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Content</p>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {item.metric && typeof item.metric === 'string' && item.metric.includes('Time')
                    ? `${Math.floor(item.ai_content / 60)}m ${Math.floor(item.ai_content % 60)}s`
                    : (item.ai_content || 0).toLocaleString()
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manual Content</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {item.metric && typeof item.metric === 'string' && item.metric.includes('Time')
                    ? `${Math.floor(item.regular_content / 60)}m ${Math.floor(item.regular_content % 60)}s`
                    : (item.regular_content || 0).toLocaleString()
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Difference</p>
                <p className={`text-lg font-semibold ${
                  item.difference_percentage > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(item.difference_percentage > 0 ? '+' : '')}{(item.difference_percentage || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AIContentPerformance;
