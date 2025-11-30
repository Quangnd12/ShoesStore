import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

const DynamicTabs = ({ tabs, onTabChange, onTabClose, onAddTab, renderTabContent }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Ensure activeTab is within bounds
  useEffect(() => {
    if (activeTab >= tabs.length && tabs.length > 0) {
      setActiveTab(tabs.length - 1);
    }
  }, [tabs.length, activeTab]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) onTabChange(index);
  };

  const handleTabClose = (index, e) => {
    e.stopPropagation();
    if (tabs.length > 1) {
      if (activeTab >= index && activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
      onTabClose(index);
    }
  };

  const handleAddTab = () => {
    onAddTab();
    // Don't automatically switch to new tab - let user click on it
    // This prevents race conditions with state updates
  };

  return (
    <div>
      <div className="border-b border-gray-200 mb-4">
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`flex items-center px-4 py-2 rounded-t-lg cursor-pointer transition whitespace-nowrap ${
                activeTab === index
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => handleTabClick(index)}
            >
              <span className="mr-2 text-sm font-medium">{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleTabClose(index, e)}
                  className={`ml-2 transition ${
                    activeTab === index
                      ? "text-white hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center border border-blue-300 hover:border-blue-500"
          >
            <Plus size={18} className="mr-1" />
            <span className="text-sm">Thêm</span>
          </button>
        </div>
      </div>
      <div>
        {tabs[activeTab] ? (
          renderTabContent(tabs[activeTab], activeTab)
        ) : (
          <div className="text-center py-8 text-gray-500">
            Đang tải...
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicTabs;






