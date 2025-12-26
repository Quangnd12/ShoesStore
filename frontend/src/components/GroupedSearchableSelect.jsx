import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronRight, X } from "lucide-react";

const GroupedSearchableSelect = ({ 
  products = [], 
  value, 
  onChange, 
  placeholder = "Chọn sản phẩm..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Nhóm sản phẩm theo tên
  const groupedProducts = products.reduce((acc, product) => {
    const groupName = product.name;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(product);
    return acc;
  }, {});

  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filteredGroups = Object.entries(groupedProducts).filter(([groupName, items]) => {
    const searchLower = searchTerm.toLowerCase();
    const groupMatches = groupName.toLowerCase().includes(searchLower);
    const itemMatches = items.some(item => 
      item.size?.toString().toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower) ||
      item.color?.toLowerCase().includes(searchLower)
    );
    return groupMatches || itemMatches;
  });

  // Tự động mở rộng nhóm khi tìm kiếm
  useEffect(() => {
    if (searchTerm) {
      const newExpanded = {};
      filteredGroups.forEach(([groupName]) => {
        newExpanded[groupName] = true;
      });
      setExpandedGroups(newExpanded);
    }
  }, [searchTerm]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus vào ô tìm kiếm khi mở dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleSelect = (product) => {
    onChange(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  // Tìm sản phẩm đã chọn
  const selectedProduct = products.find(p => p.id === value);
  const displayText = selectedProduct 
    ? `${selectedProduct.name} - Size: ${selectedProduct.size || "N/A"}`
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
          isOpen 
            ? "border-blue-500 ring-2 ring-blue-200" 
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <span className={`text-sm ${!selectedProduct ? "text-gray-400" : "text-gray-700"}`}>
          {displayText}
        </span>
        <div className="flex items-center gap-2">
          {selectedProduct && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search Box */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, size..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-80">
            {/* Option: Tạo sản phẩm mới */}
            <div
              onClick={() => handleSelect(null)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">-- Tạo sản phẩm mới --</span>
            </div>

            {/* Grouped Products */}
            {filteredGroups.length > 0 ? (
              filteredGroups.map(([groupName, items]) => (
                <div key={groupName} className="border-b border-gray-100">
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroup(groupName)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-800">{groupName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {items.length} biến thể
                      </span>
                      {expandedGroups[groupName] ? (
                        <ChevronDown size={16} className="text-gray-600" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Group Items */}
                  {expandedGroups[groupName] && (
                    <div className="bg-white">
                      {items.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelect(product)}
                          className={`px-8 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors ${
                            value === product.id ? "bg-blue-100 border-l-4 border-blue-600" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Size: <span className="font-medium">{product.size || "N/A"}</span>
                            </span>
                            {product.brand && (
                              <span className="text-xs text-gray-500">{product.brand}</span>
                            )}
                          </div>
                          {product.color && (
                            <span className="text-xs text-gray-500">Màu: {product.color}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Không tìm thấy sản phẩm nào
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedSearchableSelect;
