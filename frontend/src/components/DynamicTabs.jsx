import { useState } from "react";
import { X, Plus } from "lucide-react";

const DynamicTabs = ({ tabs, onTabChange, onTabClose, onAddTab, renderTabContent }) => {
  const [activeTab, setActiveTab] = useState(0);

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
    const newIndex = tabs.length;
    onAddTab();
    setActiveTab(newIndex);
  };

  return (
    <div>
      <div className="flex items-center border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`flex items-center px-4 py-2 border-b-2 cursor-pointer transition ${
              activeTab === index
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleTabClick(index)}
          >
            <span className="mr-2 text-sm font-medium">{tab.label}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => handleTabClose(index, e)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddTab}
          className="ml-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition flex items-center"
        >
          <Plus size={18} className="mr-1" />
          <span className="text-sm">Thêm</span>
        </button>
      </div>
      <div>{renderTabContent(tabs[activeTab], activeTab)}</div>
    </div>
  );
};

export default DynamicTabs;



