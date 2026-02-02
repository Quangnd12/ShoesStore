import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Save, AlertCircle, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { purchaseInvoicesAPI, suppliersAPI, productsAPI } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import ConfirmDialog from '../../ConfirmDialog';

const PurchaseInvoiceEditModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onSuccess 
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    invoice_date: '',
    notes: '',
    items: []
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // Load suppliers and products
  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
      loadProducts();
    }
  }, [isOpen]);

  // Initialize form when invoice changes
  useEffect(() => {
    if (invoice && isOpen) {
      const initialData = {
        supplier_id: invoice.supplier_id || '',
        invoice_date: invoice.invoice_date ? invoice.invoice_date.split('T')[0] : '',
        notes: invoice.notes || '',
        items: (invoice.items || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name || item.name,
          size_eu: item.size_eu || '',
          quantity: item.quantity || 0,
          unit_cost: item.unit_cost || 0,
          image_url: item.image_url || '',
          brand: item.brand || ''
        }))
      };
      setFormData(initialData);
      setOriginalData(JSON.stringify(initialData));
      setHasChanges(false);
      // Expand all items by default
      const expanded = {};
      initialData.items.forEach((_, idx) => { expanded[idx] = true; });
      setExpandedItems(expanded);
    }
  }, [invoice, isOpen]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      setHasChanges(JSON.stringify(formData) !== originalData);
    }
  }, [formData, originalData]);

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 1000 });
      const productsData = response.data?.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleProductSelect = (index, product) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        product_name: product.name,
        image_url: product.image_url || '',
        brand: product.brand || ''
      };
      return { ...prev, items: newItems };
    });
    setShowProductDropdown(null);
    setProductSearch('');
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: '',
        product_name: '',
        size_eu: '',
        quantity: 1,
        unit_cost: 0,
        image_url: '',
        brand: ''
      }]
    }));
    // Expand new item
    setExpandedItems(prev => ({ ...prev, [formData.items.length]: true }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      showToast('Hóa đơn phải có ít nhất 1 sản phẩm', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const toggleItemExpand = (index) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const calculateTotal = useCallback(() => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
    }, 0);
  }, [formData.items]);

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const handleSave = async () => {
    // Validation
    if (!formData.supplier_id) {
      showToast('Vui lòng chọn nhà cung cấp', 'error');
      return;
    }
    if (!formData.invoice_date) {
      showToast('Vui lòng chọn ngày hóa đơn', 'error');
      return;
    }
    if (formData.items.length === 0) {
      showToast('Hóa đơn phải có ít nhất 1 sản phẩm', 'error');
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.product_id) {
        showToast(`Sản phẩm ${i + 1}: Vui lòng chọn sản phẩm`, 'error');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        showToast(`Sản phẩm ${i + 1}: Số lượng phải lớn hơn 0`, 'error');
        return;
      }
      if (!item.unit_cost || item.unit_cost <= 0) {
        showToast(`Sản phẩm ${i + 1}: Giá nhập phải lớn hơn 0`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      await purchaseInvoicesAPI.update(invoice.id, {
        supplier_id: parseInt(formData.supplier_id),
        invoice_date: formData.invoice_date,
        notes: formData.notes,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          size_eu: item.size_eu || null,
          quantity: parseInt(item.quantity),
          unit_cost: parseFloat(item.unit_cost)
        }))
      });

      showToast('Cập nhật hóa đơn thành công!', 'success');
      window.dispatchEvent(new Event('products-updated'));
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  if (!isOpen || !invoice) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Chỉnh sửa hóa đơn nhập</h2>
              <p className="text-blue-100 text-sm mt-1">#{invoice.invoice_number}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => handleFieldChange('supplier_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hóa đơn <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleFieldChange('invoice_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tổng tiền
                </label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg font-bold text-blue-700">
                  {new Intl.NumberFormat('vi-VN').format(calculateTotal())} đ
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ghi chú cho hóa đơn..."
              />
            </div>

            {/* Items */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={20} />
                  Danh sách sản phẩm ({formData.items.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Thêm sản phẩm
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  >
                    {/* Item Header */}
                    <div 
                      className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleItemExpand(index)}
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.product_name || `Sản phẩm ${index + 1}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.size_eu && `Size: ${item.size_eu} • `}
                            SL: {item.quantity} • 
                            {new Intl.NumberFormat('vi-VN').format(item.quantity * item.unit_cost)} đ
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={18} />
                        </button>
                        {expandedItems[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Item Details */}
                    {expandedItems[index] && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Product Select */}
                          <div className="lg:col-span-2 relative">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={showProductDropdown === index ? productSearch : (item.product_name || '')}
                                onChange={(e) => {
                                  setProductSearch(e.target.value);
                                  setShowProductDropdown(index);
                                }}
                                onFocus={() => setShowProductDropdown(index)}
                                placeholder="Tìm sản phẩm..."
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            
                            {showProductDropdown === index && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                  filteredProducts.map(product => (
                                    <div
                                      key={product.id}
                                      onClick={() => handleProductSelect(index, product)}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                    >
                                      {product.image_url ? (
                                        <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                          <Package size={12} />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.brand || 'Không có thương hiệu'}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy sản phẩm</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Size */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                            <input
                              type="text"
                              value={item.size_eu}
                              onChange={(e) => handleItemChange(index, 'size_eu', e.target.value)}
                              placeholder="VD: 38, 39..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Số lượng <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>

                          {/* Unit Cost */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Giá nhập <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.unit_cost}
                              onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>

                          {/* Subtotal */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Thành tiền</label>
                            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
                              {new Intl.NumberFormat('vi-VN').format(item.quantity * item.unit_cost)} đ
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Changes Warning */}
            {hasChanges && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                <AlertCircle size={18} />
                <span className="text-sm">Bạn có thay đổi chưa lưu</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Tổng: <span className="font-bold text-lg text-blue-600">
                {new Intl.NumberFormat('vi-VN').format(calculateTotal())} đ
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        title="Xác nhận thoát"
        message="Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?"
        confirmText="Thoát"
        cancelText="Tiếp tục chỉnh sửa"
        confirmColor="red"
        onConfirm={handleConfirmClose}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};

export default PurchaseInvoiceEditModal;
