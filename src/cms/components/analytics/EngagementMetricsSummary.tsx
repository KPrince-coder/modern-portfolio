import React from 'react';
import { motion } from 'framer-motion';

interface EngagementMetric {
  icon: React.ReactNode;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}

interface EngagementMetricsSummaryProps {
  metrics: EngagementMetric[];
}

const EngagementMetricsSummary: React.FC<EngagementMetricsSummaryProps> = ({ metrics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${metric.bgColor} ${metric.textColor} mr-4`}>
              {metric.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.title}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default EngagementMetricsSummary;
