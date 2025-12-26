import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SalesInvoiceForm = ({
  tab,
  tabIndex,
  products,
  onSubmit,
  onTabDataChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onCancel
}) => {
  return (
    <form onSubmit={(e) => onSubmit(e, tabIndex)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số hóa đơn *
          </label>
          <input
            type="text"
            required
            value={tab.data.invoice_number}
            onChange={(e) => onTabDataChange(tabIndex, "invoice_number", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày *
          </label>
          <input
            type="date"
            required
            value={tab.data.invoice_date}
            onChange={(e) => onTabDataChange(tabIndex, "invoice_date", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khách hàng
          </label>
          <input
            type="text"
            value={tab.data.customer_name}
            onChange={(e) => onTabDataChange(tabIndex, "customer_name", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={tab.data.customer_phone}
            onChange={(e) => onTabDataChange(tabIndex, "customer_phone", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={tab.data.customer_email}
            onChange={(e) => onTabDataChange(tabIndex, "customer_email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          value={tab.data.notes}
          onChange={(e) => onTabDataChange(tabIndex, "notes", e.target.value)}
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Sản phẩm *
          </label>
          <button
            type="button"
            onClick={() => onAddItem(tabIndex)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {tab.data.items.map((item, itemIndex) => (
            <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-700">Sản phẩm {itemIndex + 1}</h4>
                {tab.data.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveItem(tabIndex, itemIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Sản phẩm *
                  </label>
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) => onItemChange(tabIndex, itemIndex, "product_id", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onItemChange(tabIndex, itemIndex, "quantity", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Đơn giá
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => onItemChange(tabIndex, itemIndex, "unit_price", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Đóng modal (ESC)"
        >
          Hủy (ESC)
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tạo hóa đơn
        </button>
      </div>
    </form>
  );
};

export default SalesInvoiceForm;