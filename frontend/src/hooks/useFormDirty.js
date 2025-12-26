import { useState, useEffect } from 'react';

/**
 * Custom hook để theo dõi form có thay đổi hay không
 * @param {Object} formData - Dữ liệu form hiện tại
 * @param {Object} initialData - Dữ liệu ban đầu
 * @returns {boolean} - true nếu form đã thay đổi
 */
export const useFormDirty = (formData, initialData) => {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(hasChanges);
  }, [formData, initialData]);

  return isDirty;
};

/**
 * Hook để hiển thị cảnh báo khi rời khỏi trang với form chưa lưu
 * @param {boolean} isDirty - Form có thay đổi hay không
 * @param {string} message - Thông báo cảnh báo
 */
export const useUnsavedChangesWarning = (isDirty, message = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?') => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);
};
