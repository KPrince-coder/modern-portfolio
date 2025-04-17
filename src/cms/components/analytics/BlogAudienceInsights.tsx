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
  // Generate chart colors
  const generateColors = (count: number, opacity: number = 0.7) => {
    const baseColors = [
      `rgba(99, 102, 241, ${opacity})`,  // Indigo
      `rgba(16, 185, 129, ${opacity})`,  // Green
      `rgba(239, 68, 68, ${opacity})`,   // Red
      `rgba(249, 115, 22, ${opacity})`,  // Orange
      `rgba(234, 179, 8, ${opacity})`,   // Yellow
      `rgba(109, 40, 217, ${opacity})`,  // Purple
      `rgba(107, 114, 128, ${opacity})`, // Gray
      `rgba(14, 165, 233, ${opacity})`,  // Sky
      `rgba(236, 72, 153, ${opacity})`,  // Pink
      `rgba(168, 85, 247, ${opacity})`,  // Violet
    ];

    // If we need more colors than in our base set, we'll generate them
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    } else {
      const colors = [...baseColors];
      for (let i = baseColors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        colors.push(`rgba(${r}, ${g}, ${b}, ${opacity})`);
      }
      return colors;
    }
  };

  // Process geographic distribution data from the backend
  const geographicData = (() => {
    if (!analyticsData?.audienceInsights?.locationDistribution) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
      };
    }

    // Sort by count and take top 6 countries, group the rest as 'Other'
    const sortedLocations = Object.entries(analyticsData.audienceInsights.locationDistribution)
// @ts-ignore
      .sort((a, b) => b[1] - a[1]);

    let labels = [];
    let data = [];

    if (sortedLocations.length > 6) {
      // Take top 6 countries
      const top6 = sortedLocations.slice(0, 6);
      labels = top6.map(([country]) => country);
      data = top6.map(([, count]) => count);

      // Sum the rest as 'Other'
// @ts-ignore
      const otherSum = sortedLocations.slice(6).reduce((sum, [, count]) => sum + count, 0);
      if (otherSum > 0) {
        labels.push('Other');
        data.push(otherSum);
      }
    } else {
      labels = sortedLocations.map(([country]) => country);
      data = sortedLocations.map(([, count]) => count);
    }

    const backgroundColors = generateColors(labels.length);
    const borderColors = generateColors(labels.length, 1);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  })();

  // Process device distribution data from the backend
  const deviceData = (() => {
    if (!analyticsData?.audienceInsights?.deviceDistribution) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
      };
    }

    const deviceDist = analyticsData.audienceInsights.deviceDistribution;
    const labels = Object.keys(deviceDist).map(key => key.charAt(0).toUpperCase() + key.slice(1));
    const data = Object.values(deviceDist);

    const backgroundColors = generateColors(labels.length);
    const borderColors = generateColors(labels.length, 1);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  })();

  // Process browser distribution data from the backend
  const browserData = (() => {
    if (!analyticsData?.audienceInsights?.browserDistribution) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
      };
    }

    const browserDist = analyticsData.audienceInsights.browserDistribution;
    const labels = Object.keys(browserDist);
    const data = Object.values(browserDist);

    const backgroundColors = generateColors(labels.length);
    const borderColors = generateColors(labels.length, 1);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  })();

  // Process visitor type data from the backend
  const visitorTypeData = (() => {
    if (!analyticsData?.audienceInsights?.newVsReturning) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
      };
    }

    const { new: newVisitors, returning } = analyticsData.audienceInsights.newVsReturning;
    const labels = ['New', 'Returning'];
    const data = [newVisitors, returning];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',  // Indigo for new
            'rgba(16, 185, 129, 0.7)',  // Green for returning
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(16, 185, 129, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  })();

  // Check if we have enough data to show traffic sources and audience growth
  // For now, we'll use placeholders until the API provides this data

  // Traffic sources placeholder
  const trafficSourceData = {
    labels: ['No Data Available'],
    datasets: [
      {
        label: 'Traffic Sources',
        data: [100], // Placeholder
        backgroundColor: 'rgba(209, 213, 219, 0.7)', // Gray
        borderColor: 'rgba(209, 213, 219, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Audience growth placeholder
  const audienceGrowthData = {
    labels: ['No Data Available'],
    datasets: [
      {
        label: 'Visitors',
        data: [0], // Placeholder
        backgroundColor: 'rgba(209, 213, 219, 0.2)', // Gray
        borderColor: 'rgba(209, 213, 219, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // If we have visitor data, create a simple audience growth chart based on that
  if (analyticsData?.audienceInsights?.newVsReturning) {
    const totalVisitors = (analyticsData.audienceInsights.newVsReturning.new ?? 0) +
                          (analyticsData.audienceInsights.newVsReturning.returning ?? 0);

    if (totalVisitors > 0) {
      // Create a simple growth chart with just one data point
      audienceGrowthData.labels = ['Current'];
      audienceGrowthData.datasets = [
        {
          label: 'Total Visitors',
          data: [totalVisitors],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          fill: true,
        },
      ];
    }
  }

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
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {analyticsData?.audienceInsights ?
                    ((analyticsData.audienceInsights.newVsReturning?.new ?? 0) +
                     (analyticsData.audienceInsights.newVsReturning?.returning ?? 0)).toLocaleString() :
                    '0'}
                </p>
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
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {analyticsData?.audienceInsights?.newVsReturning?.new?.toLocaleString() ?? '0'}
                </p>
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
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {analyticsData?.audienceInsights?.newVsReturning?.returning?.toLocaleString() ?? '0'}
                </p>
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
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {analyticsData?.summary?.avgTimeSpent ?
                    `${Math.floor(analyticsData.summary.avgTimeSpent / 60)}m ${Math.floor(analyticsData.summary.avgTimeSpent % 60)}s` :
                    '0m 0s'}
                </p>
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
              {deviceData.datasets[0].data.length > 0 ? (
                <Pie data={deviceData} options={pieOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">No device data available</p>
                </div>
              )}
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
            {trafficSourceData.labels[0] !== 'No Data Available' ? (
              <Bar data={trafficSourceData} options={barOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No traffic source data available</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">This data will be available once we collect more analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Audience Growth */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
            Audience Growth Over Time
          </h3>
          <div className="h-80">
            {audienceGrowthData.labels[0] !== 'No Data Available' ? (
              <Line data={audienceGrowthData} options={lineOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No audience growth data available</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">This data will be available once we collect more analytics</p>
              </div>
            )}
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
              {(() => {
                if (!analyticsData?.audienceInsights?.locationDistribution) {
                  return 'No geographic data available yet.';
                }

                const locations = Object.entries(analyticsData.audienceInsights.locationDistribution);
                if (locations.length === 0) {
                  return 'No geographic data available yet.';
                }

                // Find the top country
// @ts-ignore
                const sortedLocations = [...locations].sort((a, b) => b[1] - a[1]);
                const [topCountry, topCount] = sortedLocations[0];
// @ts-ignore
                const total = locations.reduce((sum, [, count]) => sum + count, 0);
// @ts-ignore
                const percentage = Math.round((topCount / total) * 100);

                return `${percentage}% of your audience is from ${topCountry}. Consider creating content specifically targeted to this audience or expanding to reach other regions.`;
              })()}
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 dark:border-green-400">
            <h3 className="text-md font-medium text-green-800 dark:text-green-300 mb-2">
              Device Optimization
            </h3>
            <p className="text-sm text-green-700 dark:text-green-200">
              {(() => {
                if (!analyticsData?.audienceInsights?.deviceDistribution) {
                  return 'No device data available yet.';
                }

                const devices = analyticsData.audienceInsights.deviceDistribution;
                const mobileCount = devices['mobile'] || 0;
// @ts-ignore
                const total = Object.values(devices).reduce((sum, count) => sum + count, 0);

                if (total === 0) {
                  return 'No device data available yet.';
                }

// @ts-ignore
                const mobilePercentage = Math.round((mobileCount / total) * 100);

                return `Mobile traffic accounts for ${mobilePercentage}% of your audience. ${mobilePercentage > 30 ? 'Ensure your blog is fully optimized for mobile devices to improve user experience.' : 'Consider focusing on desktop optimization while maintaining mobile compatibility.'}`;
              })()}
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
            <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
              Visitor Retention
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              {(() => {
                if (!analyticsData?.audienceInsights?.newVsReturning) {
                  return 'No visitor retention data available yet.';
                }

                const { new: newVisitors = 0, returning = 0 } = analyticsData.audienceInsights.newVsReturning;
                const total = newVisitors + returning;

                if (total === 0) {
                  return 'No visitor retention data available yet.';
                }

                const returningPercentage = Math.round((returning / total) * 100);

                if (returningPercentage < 20) {
                  return `Only ${returningPercentage}% of your visitors are returning users. Consider implementing a newsletter or content series to increase this percentage.`;
                } else if (returningPercentage < 40) {
                  return `${returningPercentage}% of your visitors are returning users. This is good, but you could implement a newsletter or content series to increase this percentage further.`;
                } else {
                  return `${returningPercentage}% of your visitors are returning users. This is excellent! Your content is clearly engaging your audience.`;
                }
              })()}
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
            <h3 className="text-md font-medium text-purple-800 dark:text-purple-300 mb-2">
              Traffic Source Diversification
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-200">
              {(() => {
                // Currently we don't have real traffic source data from the API
                // When it becomes available, we can replace this with real insights
                if (analyticsData?.summary?.totalViews && analyticsData.summary.totalViews > 0) {
                  return 'Consider diversifying your traffic sources by promoting your content on social media platforms and building relationships with other websites for referral traffic.';
                } else {
                  return 'No traffic source data available yet. Once you start receiving traffic, we will provide insights on how to diversify your traffic sources.';
                }
              })()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogAudienceInsights;
