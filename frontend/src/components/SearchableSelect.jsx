import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Chọn...",
  emptyText = "Không tìm thấy kết quả",
  emptyMessage, // Alias for emptyText
  labelKey = "name",
  valueKey = "id",
  // New props for backward compatibility
  getOptionLabel,
  getOptionValue,
  searchPlaceholder,
  label,
  required,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Helper functions with backward compatibility
  const getLabel = (option) => {
    if (getOptionLabel) return getOptionLabel(option);
    return option[labelKey] || "";
  };

  const getValue = (option) => {
    if (getOptionValue) return getOptionValue(option);
    return option[valueKey];
  };

  // Lọc options theo từ khóa tìm kiếm
  const filteredOptions = options.filter(option => {
    const label = getLabel(option);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  const handleSelect = (option) => {
    onChange(getValue(option));
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  // Tìm option đã chọn
  const selectedOption = options.find(opt => {
    const optValue = getValue(opt);
    return optValue === value || optValue === parseInt(value);
  });
  const displayText = selectedOption ? getLabel(selectedOption) : placeholder;

  const finalEmptyText = emptyMessage || emptyText;
  const finalSearchPlaceholder = searchPlaceholder || "Tìm kiếm...";

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
          isOpen 
            ? "border-blue-500 ring-2 ring-blue-200" 
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <span className={`text-sm ${!selectedOption ? "text-gray-400" : "text-gray-700"}`}>
          {displayText}
        </span>
        <div className="flex items-center gap-2">
          {selectedOption && (
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
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Box */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={finalSearchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optValue = getValue(option);
                const isSelected = value === optValue || value === optValue?.toString();
                
                return (
                  <div
                    key={optValue || index}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-100 border-l-4 border-blue-600 font-medium" 
                        : ""
                    }`}
                  >
                    <span className="text-sm text-gray-700">{getLabel(option)}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {finalEmptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
