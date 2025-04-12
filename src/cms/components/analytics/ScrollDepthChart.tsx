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

interface ScrollDepthChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
}

const ScrollDepthChart: React.FC<ScrollDepthChartProps> = ({ 
  data,
  title = 'Scroll Depth Analysis'
}) => {
  // Prepare chart data
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Percentage of Visitors',
        data: data.values,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
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
        <Line data={chartData} options={chartOptions} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Shows how far visitors scroll down your blog post. Higher percentages indicate more engaging content.
      </p>
    </motion.div>
  );
};

export default ScrollDepthChart;
