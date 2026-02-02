import { useState, useEffect } from "react";
import { 
  Clock, 
  ShoppingCart, 
  Package, 
  FileText, 
  TrendingUp,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { salesInvoicesAPI, purchaseInvoicesAPI } from "../../services/api";

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const [salesRes, purchaseRes] = await Promise.all([
        salesInvoicesAPI.getAll({ limit: 5 }),
        purchaseInvoicesAPI.getAll({ limit: 5 })
      ]);

      const salesInvoices = (salesRes.data?.invoices || []).map(inv => ({
        id: `sale-${inv.id}`,
        type: 'sale',
        title: `Bán hàng #${inv.invoice_number}`,
        description: inv.customer_name || inv.account_username || 'Khách lẻ',
        amount: inv.final_amount || inv.total_revenue || 0,
        date: new Date(inv.invoice_date),
        icon: ShoppingCart,
        color: 'text-green-500 bg-green-50'
      }));

      const purchaseInvoices = (purchaseRes.data?.invoices || []).map(inv => ({
        id: `purchase-${inv.id}`,
        type: 'purchase',
        title: `Nhập hàng #${inv.invoice_number}`,
        description: inv.supplier_name || 'Nhà cung cấp',
        amount: inv.total_cost || 0,
        date: new Date(inv.invoice_date),
        icon: Package,
        color: 'text-blue-500 bg-blue-50'
      }));

      // Merge and sort by date
      const allActivities = [...salesInvoices, ...purchaseInvoices]
        .sort((a, b) => b.date - a.date)
        .slice(0, 8);

      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('vi-VN').format(amount);
    return type === 'sale' ? `+${formatted}đ` : `-${formatted}đ`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock size={18} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Hoạt động gần đây</h3>
            <p className="text-xs text-gray-400">Cập nhật realtime</p>
          </div>
        </div>
        <button 
          onClick={fetchActivities}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Activities List */}
      <div className="divide-y divide-gray-50">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id}
                className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.3s ease-out forwards'
                }}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-lg ${activity.color} transition-transform group-hover:scale-110`}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {activity.description}
                  </p>
                </div>

                {/* Amount & Time */}
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    activity.type === 'sale' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {formatAmount(activity.amount, activity.type)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(activity.date)}
                  </p>
                </div>

                {/* Arrow on hover */}
                <ArrowRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1">
            Xem tất cả hoạt động
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RecentActivities;
