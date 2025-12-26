import React from 'react';

const InvoiceFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  type = 'purchase' // 'purchase' or 'sales'
}) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">
          Bộ lọc hóa đơn {type === 'purchase' ? 'nhập hàng' : 'bán hàng'}
        </h3>
        <button
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={onClearFilters}
        >
          Xóa bộ lọc
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Số hóa đơn
          </label>
          <input
            type="text"
            value={filters.invoiceNumber}
            onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm theo số hóa đơn"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            {type === 'purchase' ? 'Nhà cung cấp' : 'Khách hàng'}
          </label>
          <input
            type="text"
            value={type === 'purchase' ? filters.supplier : filters.customer}
            onChange={(e) => handleFilterChange(
              type === 'purchase' ? 'supplier' : 'customer', 
              e.target.value
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder={type === 'purchase' ? 'Tên nhà cung cấp' : 'Tên khách hàng'}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Ngày từ</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Ngày đến</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;