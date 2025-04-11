import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';

const AnalyticsSettings: React.FC = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [anonymizeIp, setAnonymizeIp] = useState(true);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [excludedPaths, setExcludedPaths] = useState<string[]>(['/admin', '/login', '/private']);
  const [newPath, setNewPath] = useState('');
  const [dataRetentionDays, setDataRetentionDays] = useState(365);
  const [cookieConsent, setCookieConsent] = useState(true);
  const [cookieMessage, setCookieMessage] = useState(
    'This website uses cookies to enhance your experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies.'
  );

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // In a real implementation, this would save to Supabase
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settings;
    },
    onSuccess: () => {
      alert('Settings saved successfully!');
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settings = {
      trackingEnabled,
      anonymizeIp,
      trackingCode,
      excludedPaths,
      dataRetentionDays,
      cookieConsent,
      cookieMessage,
    };
    
    saveSettingsMutation.mutateAsync(settings);
  };

  // Handle adding a new excluded path
  const handleAddPath = () => {
    if (newPath && !excludedPaths.includes(newPath)) {
      setExcludedPaths([...excludedPaths, newPath]);
      setNewPath('');
    }
  };

  // Handle removing an excluded path
  const handleRemovePath = (path: string) => {
    setExcludedPaths(excludedPaths.filter(p => p !== path));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Analytics Settings
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              General Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="trackingEnabled" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Analytics Tracking
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Collect data about visitors to your portfolio
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="trackingEnabled"
                    checked={trackingEnabled}
                    onChange={() => setTrackingEnabled(!trackingEnabled)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-12 ${trackingEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white dark:bg-gray-200 w-4 h-4 rounded-full transition-transform ${trackingEnabled ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="anonymizeIp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Anonymize IP Addresses
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mask the last octet of visitor IP addresses for privacy
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="anonymizeIp"
                    checked={anonymizeIp}
                    onChange={() => setAnonymizeIp(!anonymizeIp)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-12 ${anonymizeIp ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white dark:bg-gray-200 w-4 h-4 rounded-full transition-transform ${anonymizeIp ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div>
                <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  id="dataRetention"
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(parseInt(e.target.value) || 365)}
                  min="30"
                  max="730"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  How long to keep analytics data before automatic deletion (30-730 days)
                </p>
              </div>
            </div>
          </div>
          
          {/* Tracking Code */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              External Analytics Integration
            </h3>
            <div>
              <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Tracking Code (Optional)
              </label>
              <textarea
                id="trackingCode"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm"
                placeholder="<!-- Paste Google Analytics, Plausible, or other tracking code here -->"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add third-party analytics tracking code (e.g., Google Analytics, Plausible, Fathom)
              </p>
            </div>
          </div>
          
          {/* Excluded Paths */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Excluded Paths
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="/path-to-exclude"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddPath}
                  disabled={!newPath}
                >
                  Add
                </Button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Paths excluded from tracking:
                </p>
                {excludedPaths.length > 0 ? (
                  <ul className="space-y-2">
                    {excludedPaths.map((path, index) => (
                      <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-md">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {path}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePath(path)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No paths excluded
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Cookie Consent */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Cookie Consent
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="cookieConsent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Cookie Consent Banner
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Display a banner asking for consent to use cookies
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="cookieConsent"
                    checked={cookieConsent}
                    onChange={() => setCookieConsent(!cookieConsent)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-12 ${cookieConsent ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white dark:bg-gray-200 w-4 h-4 rounded-full transition-transform ${cookieConsent ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div>
                <label htmlFor="cookieMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cookie Consent Message
                </label>
                <textarea
                  id="cookieMessage"
                  value={cookieMessage}
                  onChange={(e) => setCookieMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="Enter your cookie consent message"
                />
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Preview:
                </p>
                {cookieConsent && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {cookieMessage}
                    </p>
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md">
                        Accept
                      </button>
                      <button className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              isLoading={saveSettingsMutation.isPending}
            >
              Save Settings
            </Button>
          </div>
        </form>
      </motion.div>
      
      {/* Privacy Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Privacy Best Practices
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">GDPR Compliance</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              If you have visitors from the EU, ensure you have a clear privacy policy and obtain consent before collecting analytics data.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Data Minimization</h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Only collect the data you need. Anonymizing IP addresses and setting appropriate retention periods helps protect user privacy.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Cookie Notices</h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              Be transparent about your use of cookies. Provide clear information about what data you collect and how you use it.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsSettings;
