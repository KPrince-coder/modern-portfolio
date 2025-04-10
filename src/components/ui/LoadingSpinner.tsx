interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner = ({
  size = 'md',
  color = 'indigo-600',
  text = 'Loading...',
  fullPage = false,
}: LoadingSpinnerProps) => {
  // Size mappings
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  // Text size mappings
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinnerClasses = `inline-block ${sizeMap[size]} border-${color} border-t-transparent rounded-full animate-spin`;
  const textClasses = `mt-4 ${textSizeMap[size]} text-gray-600 dark:text-gray-300`;

  const content = (
    <>
      <div className={spinnerClasses}></div>
      {text && <p className={textClasses}>{text}</p>}
    </>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {content}
    </div>
  );
};

export default LoadingSpinner;
