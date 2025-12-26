import { useState } from "react";
import { X, FileSpreadsheet, Download, Calendar, Filter } from "lucide-react";

const ExportExcelModal = ({ 
  isOpen, 
  onClose, 
  onExport,
  totalRecords = 0 
}) => {
  const [exportOptions, setExportOptions] = useState({
    dateRange: "all", // "all", "today", "thisWeek", "thisMonth", "custom"
    dateFrom: "",
    dateTo: "",
    includeCustomerInfo: true,
    includeProductDetails: true,
    includePaymentInfo: true,
    groupBy: "none", // "none", "date", "customer", "product"
    format: "detailed" // "detailed", "summary"
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateRangeChange = (range) => {
    const today = new Date();
    const options = { ...exportOptions, dateRange: range };

    switch (range) {
      case "today":
        options.dateFrom = today.toISOString().split('T')[0];
        options.dateTo = today.toISOString().split('T')[0];
        break;
      case "thisWeek":
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        options.dateFrom = startOfWeek.toISOString().split('T')[0];
        options.dateTo = endOfWeek.toISOString().split('T')[0];
        break;
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        options.dateFrom = startOfMonth.toISOString().split('T')[0];
        options.dateTo = endOfMonth.toISOString().split('T')[0];
        break;
      case "all":
      case "custom":
        // Keep existing dates or clear them
        break;
    }

    setExportOptions(options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Xuất Excel - Hóa đơn bán hàng</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Thông tin xuất file</h3>
            </div>
            <p className="text-sm text-blue-800">
              Tổng số hóa đơn: <span className="font-semibold">{totalRecords}</span>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              File Excel sẽ chứa thông tin chi tiết từng sản phẩm trong hóa đơn
            </p>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Khoảng thời gian
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { value: "all", label: "Tất cả" },
                { value: "today", label: "Hôm nay" },
                { value: "thisWeek", label: "Tuần này" },
                { value: "thisMonth", label: "Tháng này" },
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option.value}
                    checked={exportOptions.dateRange === option.value}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Date Range */}
            <label className="flex items-center mb-3">
              <input
                type="radio"
                name="dateRange"
                value="custom"
                checked={exportOptions.dateRange === "custom"}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Tùy chọn</span>
            </label>

            {exportOptions.dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-3 ml-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={exportOptions.dateFrom}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      dateFrom: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={exportOptions.dateTo}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      dateTo: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Filter className="w-4 h-4 inline mr-2" />
              Nội dung xuất
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCustomerInfo}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeCustomerInfo: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Thông tin khách hàng</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeProductDetails}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeProductDetails: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Chi tiết sản phẩm (màu sắc, kích cỡ)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includePaymentInfo}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includePaymentInfo: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Thông tin thanh toán</span>
              </label>
            </div>
          </div>

          {/* Format Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Định dạng xuất
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="detailed"
                  checked={exportOptions.format === "detailed"}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    format: e.target.value
                  })}
                  className="mr-2"
                />
                <div>
                  <span className="text-sm font-medium">Chi tiết</span>
                  <p className="text-xs text-gray-600">Mỗi dòng là một sản phẩm trong hóa đơn</p>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="summary"
                  checked={exportOptions.format === "summary"}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    format: e.target.value
                  })}
                  className="mr-2"
                />
                <div>
                  <span className="text-sm font-medium">Tổng hợp</span>
                  <p className="text-xs text-gray-600">Mỗi dòng là một hóa đơn</p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Xem trước cấu trúc file:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• STT, Số hóa đơn, Ngày bán</p>
              {exportOptions.includeCustomerInfo && (
                <p>• Thông tin khách hàng: Tên, SĐT, Email</p>
              )}
              {exportOptions.includeProductDetails && (
                <p>• Chi tiết sản phẩm: Tên, Màu sắc, Kích cỡ, SL, Đơn giá</p>
              )}
              {exportOptions.includePaymentInfo && (
                <p>• Thanh toán: Tổng tiền, Giảm giá, Phương thức</p>
              )}
              <p>• Ghi chú, Người tạo, Ngày tạo</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Xuất Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportExcelModal;