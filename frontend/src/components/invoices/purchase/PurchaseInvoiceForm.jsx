import React from 'react';
import { Plus } from 'lucide-react';
import ProductTabsInvoice from '../../ProductTabsInvoice';

const PurchaseInvoiceForm = ({
  tab,
  tabIndex,
  suppliers,
  products,
  categories,
  tabs,
  setTabs,
  onSubmit,
  onTabDataChange,
  onItemChange,
  onImageFileChange,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  onSubmitAll,
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
            Nhà cung cấp *
          </label>
          <select
            required
            value={tab.data.supplier_id}
            onChange={(e) => onTabDataChange(tabIndex, "supplier_id", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn nhà cung cấp</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sản phẩm *
        </label>
        <ProductTabsInvoice
          items={tab.data.items}
          tabIndex={tabIndex}
          products={products}
          categories={categories}
          handleItemChange={onItemChange}
          handleImageFileChange={onImageFileChange}
          handleAddVariant={onAddVariant}
          handleRemoveVariant={onRemoveVariant}
          handleVariantChange={onVariantChange}
          tabs={tabs}
          setTabs={setTabs}
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <div>
          {tabs.length > 1 && (
            <button
              type="button"
              onClick={onSubmitAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Tạo tất cả {tabs.length} hóa đơn</span>
            </button>
          )}
        </div>
        <div className="flex space-x-3">
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
            Tạo hóa đơn này
          </button>
        </div>
      </div>
    </form>
  );
};

export default PurchaseInvoiceForm;