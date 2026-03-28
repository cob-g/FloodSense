import { Loader2 } from 'lucide-react';

/**
 * Loading Spinner Component
 * @param {Object} props
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Center in full screen
 * @param {string} props.className - Additional classes
 */
const LoadingSpinner = ({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-orange-500 animate-spin`} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Page Loading Component - For route transitions
 */
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin" />
        {/* Inner pulse */}
        <div className="absolute inset-3 bg-orange-500/10 rounded-full animate-pulse" />
      </div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  </div>
);

/**
 * Inline Loading - For buttons or small areas
 */
export const InlineLoader = ({ className = '' }) => (
  <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
);

/**
 * Full Page Loading Overlay
 */
export const LoadingOverlay = ({ text = 'Please wait...' }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  </div>
);

export default LoadingSpinner;
