import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend = null, // { value: number, isPositive: boolean }
  subtitle = null,
  onClick = null,
  loading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate number counting
    if (typeof value === 'number' && !loading) {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, loading]);

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus size={14} />;
    return trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  };

  const getTrendColor = () => {
    if (!trend || trend.value === 0) return "text-gray-500 bg-gray-100";
    return trend.isPositive 
      ? "text-green-600 bg-green-50" 
      : "text-red-600 bg-red-50";
  };

  const formatValue = (val) => {
    if (typeof val === 'string') return val;
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-5
        transform transition-all duration-500 ease-out
        hover:shadow-lg hover:scale-[1.02] hover:border-gray-200
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">
            {title}
          </p>
          
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-1 transition-all duration-300">
              {typeof displayValue === 'number' ? formatValue(displayValue) : displayValue}
            </p>
          )}
          
          {/* Trend indicator */}
          {trend && !loading && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              <span className="text-gray-400 ml-1">vs trước</span>
            </div>
          )}
          
          {/* Subtitle */}
          {subtitle && !loading && (
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        
        {/* Icon */}
        <div className={`${color} p-3 rounded-xl shadow-sm transform transition-transform duration-300 hover:scale-110`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
      
      {/* Progress bar decoration */}
      <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: isVisible ? '100%' : '0%' }}
        />
      </div>
    </div>
  );
};

export default StatCard;
