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

interface ElementInteractionChartProps {
  data: {
    elements: string[];
    interactions: number[];
  };
  title?: string;
}

const ElementInteractionChart: React.FC<ElementInteractionChartProps> = ({ 
  data,
  title = 'Content Element Interaction'
}) => {
  // Element colors
  const elementColors: Record<string, { bg: string; border: string }> = {
    link: { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' },
    image: { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgba(16, 185, 129, 1)' },
    video: { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 1)' },
    code: { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgba(139, 92, 246, 1)' },
    text: { bg: 'rgba(249, 115, 22, 0.7)', border: 'rgba(249, 115, 22, 1)' },
  };

  // Default color for unknown elements
  const defaultColor = { bg: 'rgba(107, 114, 128, 0.7)', border: 'rgba(107, 114, 128, 1)' };

  // Get color for an element
  const getColorForElement = (element: string) => {
    return elementColors[element.toLowerCase()] || defaultColor;
  };

  // Prepare chart data
  const chartData = {
    labels: data.elements,
    datasets: [
      {
        label: 'Interaction Count',
        data: data.interactions,
        backgroundColor: data.elements.map(element => getColorForElement(element).bg),
        borderColor: data.elements.map(element => getColorForElement(element).border),
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
            return `${context.raw} interactions`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Interactions',
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
        Shows how often visitors interact with different elements in your blog post.
      </p>
    </motion.div>
  );
};

export default ElementInteractionChart;
