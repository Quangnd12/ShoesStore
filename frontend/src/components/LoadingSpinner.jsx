import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ 
  size = "default", 
  fullScreen = false, 
  message = "Đang tải...",
  overlay = false 
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.default;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className={`${spinnerSize} animate-spin text-blue-600 mx-auto`} />
          {message && (
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
        <div className="text-center">
          <Loader2 className={`${spinnerSize} animate-spin text-blue-600 mx-auto`} />
          {message && (
            <p className="mt-3 text-gray-600 text-sm font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className={`${spinnerSize} animate-spin text-blue-600 mx-auto`} />
        {message && (
          <p className="mt-3 text-gray-600 text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
