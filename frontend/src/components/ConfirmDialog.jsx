import { X } from "lucide-react";

/**
 * Component dialog xác nhận
 * @param {boolean} show - Hiển thị dialog
 * @param {string} title - Tiêu đề
 * @param {string} message - Nội dung
 * @param {Function} onConfirm - Callback khi xác nhận
 * @param {Function} onCancel - Callback khi hủy
 * @param {string} confirmText - Text nút xác nhận
 * @param {string} cancelText - Text nút hủy
 */
const ConfirmDialog = ({
  show,
  title = "Xác nhận",
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "blue",
}) => {
  if (!show) return null;

  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg ${
              colorClasses[confirmColor] || colorClasses.blue
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
