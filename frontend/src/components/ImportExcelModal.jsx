import { useState, useRef } from "react";
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";

const ImportExcelModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  suppliers = [], 
  categories = [],
  products = [] 
}) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Template Excel structure
  const excelTemplate = [
    {
      "Số hóa đơn": "PN20241213-001",
      "Mã nhà cung cấp": "1",
      "Tên nhà cung cấp": "Công ty ABC",
      "Ngày hóa đơn": "2024-12-13",
      "Ghi chú": "Nhập hàng tháng 12",
      "Mã sản phẩm (nếu có)": "",
      "Tên sản phẩm": "Giày thể thao Nike Air Max",
      "Mô tả": "Giày thể thao cao cấp",
      "Giá bán": "2500000",
      "Mã danh mục": "1",
      "Tên danh mục": "Giày thể thao",
      "Thương hiệu": "Nike",
      "Màu sắc": "Đen",
      "Kích cỡ": "42",
      "Số lượng": "10",
      "Giá nhập": "2000000",
      "URL hình ảnh": "https://example.com/image.jpg"
    }
  ];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setErrors(["Vui lòng chọn file Excel (.xlsx hoặc .xls)"]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    processExcelFile(selectedFile);
  };

  const processExcelFile = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setErrors(["File Excel không có dữ liệu"]);
          setIsProcessing(false);
          return;
        }

        // Validate and process data
        const { validData, validationErrors } = validateExcelData(jsonData);
        setPreviewData(validData);
        setErrors(validationErrors);
        setIsProcessing(false);
      } catch (error) {
        setErrors(["Lỗi đọc file Excel: " + error.message]);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateExcelData = (data) => {
    const validationErrors = [];
    const validData = [];
    const invoiceGroups = {};

    data.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (starting from 2)
      const rowErrors = [];

      // Required fields validation
      if (!row["Số hóa đơn"]) rowErrors.push(`Dòng ${rowNumber}: Thiếu số hóa đơn`);
      if (!row["Mã nhà cung cấp"] && !row["Tên nhà cung cấp"]) {
        rowErrors.push(`Dòng ${rowNumber}: Thiếu thông tin nhà cung cấp`);
      }
      if (!row["Ngày hóa đơn"]) rowErrors.push(`Dòng ${rowNumber}: Thiếu ngày hóa đơn`);
      if (!row["Tên sản phẩm"]) rowErrors.push(`Dòng ${rowNumber}: Thiếu tên sản phẩm`);
      if (!row["Số lượng"] || isNaN(row["Số lượng"]) || row["Số lượng"] <= 0) {
        rowErrors.push(`Dòng ${rowNumber}: Số lượng không hợp lệ`);
      }
      if (!row["Giá nhập"] || isNaN(row["Giá nhập"]) || row["Giá nhập"] <= 0) {
        rowErrors.push(`Dòng ${rowNumber}: Giá nhập không hợp lệ`);
      }

      // Validate supplier
      let supplierId = null;
      if (row["Mã nhà cung cấp"]) {
        const supplier = suppliers.find(s => s.id == row["Mã nhà cung cấp"]);
        if (supplier) {
          supplierId = supplier.id;
        } else {
          rowErrors.push(`Dòng ${rowNumber}: Không tìm thấy nhà cung cấp với mã ${row["Mã nhà cung cấp"]}`);
        }
      } else if (row["Tên nhà cung cấp"]) {
        const supplier = suppliers.find(s => 
          s.name.toLowerCase().includes(row["Tên nhà cung cấp"].toLowerCase())
        );
        if (supplier) {
          supplierId = supplier.id;
        } else {
          rowErrors.push(`Dòng ${rowNumber}: Không tìm thấy nhà cung cấp "${row["Tên nhà cung cấp"]}"`);
        }
      }

      // Validate category
      let categoryId = null;
      if (row["Mã danh mục"]) {
        const category = categories.find(c => c.id == row["Mã danh mục"]);
        if (category) {
          categoryId = category.id;
        } else {
          rowErrors.push(`Dòng ${rowNumber}: Không tìm thấy danh mục với mã ${row["Mã danh mục"]}`);
        }
      } else if (row["Tên danh mục"]) {
        const category = categories.find(c => 
          c.name.toLowerCase().includes(row["Tên danh mục"].toLowerCase())
        );
        if (category) {
          categoryId = category.id;
        } else {
          rowErrors.push(`Dòng ${rowNumber}: Không tìm thấy danh mục "${row["Tên danh mục"]}"`);
        }
      }

      // Check if product exists
      let productId = null;
      if (row["Mã sản phẩm (nếu có)"]) {
        const product = products.find(p => p.id == row["Mã sản phẩm (nếu có)"]);
        if (product) {
          productId = product.id;
        } else {
          rowErrors.push(`Dòng ${rowNumber}: Không tìm thấy sản phẩm với mã ${row["Mã sản phẩm (nếu có)"]}`);
        }
      }

      // For new products, category is required
      if (!productId && !categoryId) {
        rowErrors.push(`Dòng ${rowNumber}: Sản phẩm mới cần có thông tin danh mục`);
      }

      if (rowErrors.length > 0) {
        validationErrors.push(...rowErrors);
      } else {
        // Group by invoice number
        const invoiceNumber = row["Số hóa đơn"];
        if (!invoiceGroups[invoiceNumber]) {
          invoiceGroups[invoiceNumber] = {
            invoice_number: invoiceNumber,
            supplier_id: supplierId,
            invoice_date: row["Ngày hóa đơn"],
            notes: row["Ghi chú"] || "",
            items: []
          };
        }

        // Add item to invoice
        const item = {
          product_id: productId,
          name: row["Tên sản phẩm"],
          description: row["Mô tả"] || "",
          price: row["Giá bán"] ? parseFloat(row["Giá bán"]) : parseFloat(row["Giá nhập"]),
          category_id: categoryId,
          brand: row["Thương hiệu"] || "",
          color: row["Màu sắc"] || "",
          size: row["Kích cỡ"] || "",
          quantity: parseInt(row["Số lượng"]),
          unit_cost: parseFloat(row["Giá nhập"]),
          image_url: row["URL hình ảnh"] || ""
        };

        invoiceGroups[invoiceNumber].items.push(item);
      }
    });

    return {
      validData: Object.values(invoiceGroups),
      validationErrors
    };
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(excelTemplate);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_hoa_don_nhap.xlsx");
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      setErrors(["Không có dữ liệu hợp lệ để import"]);
      return;
    }

    try {
      setIsProcessing(true);
      await onImport(previewData);
      handleClose();
    } catch (error) {
      setErrors(["Lỗi import: " + error.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Import Excel - Hóa đơn nhập hàng</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tải template Excel mẫu và điền thông tin theo đúng định dạng</li>
              <li>• Mỗi dòng là một sản phẩm trong hóa đơn nhập</li>
              <li>• Có thể nhập nhiều hóa đơn cùng lúc (phân biệt bằng số hóa đơn)</li>
              <li>• Sản phẩm mới sẽ được tạo tự động nếu không có mã sản phẩm</li>
            </ul>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Tải Template Excel
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Kéo thả file Excel vào đây hoặc{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  chọn file
                </button>
              </p>
              <p className="text-sm text-gray-500">Hỗ trợ file .xlsx, .xls</p>
            </div>
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-yellow-800">Đang xử lý file...</span>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">Lỗi validation:</h4>
              </div>
              <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">
                  Dữ liệu hợp lệ ({previewData.length} hóa đơn):
                </h4>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {previewData.map((invoice, index) => (
                    <div key={index} className="border-b p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">
                          Hóa đơn: {invoice.invoice_number}
                        </h5>
                        <span className="text-sm text-gray-600">
                          {invoice.items.length} sản phẩm
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Ngày: {invoice.invoice_date} | Ghi chú: {invoice.notes || "Không có"}
                      </p>
                      <div className="text-xs text-gray-500">
                        Sản phẩm: {invoice.items.map(item => item.name).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing || errors.length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "Đang import..." : `Import ${previewData.length} hóa đơn`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExcelModal;