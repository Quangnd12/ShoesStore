import { useState, useEffect, useRef, useMemo } from 'react';

const SmartPriceInput = ({
  value,
  onChange,
  placeholder = "Nhập giá...",
  className = "",
  disabled = false,
  unit = "đ", // đ, đ/đôi, đ/size, đ/cái
  productContext = null, // { category, name, type }
  required = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Format currency - defined before useMemo to avoid reference error
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Sync input value with prop value
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setInputValue(value.toString());
    } else {
      setInputValue('');
    }
  }, [value]);

  // Generate smart suggestions based on input
  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.length === 0) return [];
    
    const numericValue = inputValue.replace(/[^\d]/g, '');
    if (!numericValue || numericValue === '0') return [];
    
    const baseNumber = parseInt(numericValue);
    if (isNaN(baseNumber)) return [];

    const results = [];
    
    // Determine unit based on product context
    const getUnit = () => {
      if (productContext?.category?.toLowerCase().includes('giày') || 
          productContext?.category?.toLowerCase().includes('dép') ||
          productContext?.name?.toLowerCase().includes('giày') ||
          productContext?.name?.toLowerCase().includes('dép')) {
        return ['đ', 'đ/đôi', 'đ/size'];
      }
      if (productContext?.category?.toLowerCase().includes('áo') || 
          productContext?.category?.toLowerCase().includes('quần') ||
          productContext?.name?.toLowerCase().includes('áo') ||
          productContext?.name?.toLowerCase().includes('quần')) {
        return ['đ', 'đ/cái', 'đ/size'];
      }
      return ['đ'];
    };

    const units = getUnit();
    
    // Generate multiplier suggestions
    const multipliers = [
      { factor: 1000, label: 'nghìn' },
      { factor: 10000, label: 'chục nghìn' },
      { factor: 100000, label: 'trăm nghìn' },
      { factor: 1000000, label: 'triệu' },
    ];

    // Add suggestions for each multiplier
    multipliers.forEach(({ factor, label }) => {
      const calculatedValue = baseNumber * factor;
      
      // Only show reasonable price ranges (10k - 100M)
      if (calculatedValue >= 10000 && calculatedValue <= 100000000) {
        units.forEach(u => {
          results.push({
            value: calculatedValue,
            displayValue: formatCurrency(calculatedValue),
            label: `${formatCurrency(calculatedValue)} ${u}`,
            description: `${baseNumber} ${label}`,
            unit: u
          });
        });
      }
    });

    // Also add the raw number if it's a reasonable price
    if (baseNumber >= 10000 && baseNumber <= 100000000) {
      units.forEach(u => {
        // Avoid duplicates
        if (!results.find(r => r.value === baseNumber && r.unit === u)) {
          results.unshift({
            value: baseNumber,
            displayValue: formatCurrency(baseNumber),
            label: `${formatCurrency(baseNumber)} ${u}`,
            description: 'Giá trị nhập',
            unit: u
          });
        }
      });
    }

    // Limit to top 6 suggestions
    return results.slice(0, 6);
  }, [inputValue, productContext]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Show suggestions when typing numbers
    if (newValue && /^\d+$/.test(newValue.replace(/[^\d]/g, ''))) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    // Pass raw value to parent
    onChange(newValue);
  };

  const handleInputFocus = () => {
    if (inputValue && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.matches(':hover')) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.value.toString());
    onChange(suggestion.value.toString());
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstBtn = suggestionsRef.current?.querySelector('button');
      firstBtn?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  const handleSuggestionKeyDown = (e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const buttons = suggestionsRef.current?.querySelectorAll('button');
      const nextBtn = buttons?.[index + 1];
      nextBtn?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
      } else {
        const buttons = suggestionsRef.current?.querySelectorAll('button');
        const prevBtn = buttons?.[index - 1];
        prevBtn?.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      inputRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSuggestionClick(suggestions[index]);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg text-sm 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${className}
        `}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Gợi ý nhanh</span>
              <span className="text-gray-500">• Tab hoặc Enter để chọn</span>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.value}-${suggestion.unit}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => handleSuggestionKeyDown(e, index)}
                className="w-full px-3 py-2.5 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-50 last:border-b-0 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                      {suggestion.label}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({suggestion.description})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border text-gray-600">
                      ↵
                    </kbd>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>↑↓ để di chuyển</span>
              <span>Esc để đóng</span>
            </div>
          </div>
        </div>
      )}

      {/* Display formatted value hint */}
      {inputValue && !showSuggestions && parseInt(inputValue) > 0 && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
          {formatCurrency(parseInt(inputValue))} {unit}
        </div>
      )}
    </div>
  );
};

export default SmartPriceInput;