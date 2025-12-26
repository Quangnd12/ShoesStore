const SkeletonLoader = ({ type = "card", count = 1, className = "" }) => {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse ${className}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        );

      case "table-row":
        return (
          <tr className="animate-pulse">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </td>
          </tr>
        );

      case "chart":
        return (
          <div className={`bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse ${className}`}>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-3/6"></div>
            </div>
            <div className="mt-6 h-64 bg-gray-200 rounded"></div>
          </div>
        );

      case "widget":
        return (
          <div className={`bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case "list":
        return (
          <div className={`bg-white rounded-lg shadow border border-gray-200 animate-pulse ${className}`}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className={`h-32 bg-gray-200 rounded animate-pulse ${className}`}></div>
        );
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
