/**
 * Utility để generate số hóa đơn tự động tăng
 */

class InvoiceNumberGenerator {
  constructor(prefix) {
    this.prefix = prefix; // 'HD' hoặc 'PN'
    this.currentDate = null;
    this.nextNumber = 1;
    this.usedNumbers = new Set();
  }

  /**
   * Generate số hóa đơn mới
   * @param {Array} existingInvoices - Danh sách hóa đơn đã có
   * @param {number} offset - Offset để tạo nhiều số liên tiếp
   * @returns {string} Số hóa đơn mới (VD: HD20251124-001)
   */
  generate(existingInvoices = [], offset = 0) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const fullPrefix = `${this.prefix}${dateStr}`;

    // Nếu ngày thay đổi, reset counter
    if (this.currentDate !== dateStr) {
      this.currentDate = dateStr;
      this.nextNumber = 1;
      this.usedNumbers.clear();

      // Tìm số lớn nhất trong database
      const todayInvoices = existingInvoices.filter((inv) => {
        if (!inv.invoice_number) return false;
        return inv.invoice_number.startsWith(fullPrefix);
      });

      if (todayInvoices.length > 0) {
        const numbers = todayInvoices
          .map((inv) => {
            const match = inv.invoice_number.match(new RegExp(`^${fullPrefix}-(\\d+)$`));
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => n > 0);

        if (numbers.length > 0) {
          this.nextNumber = Math.max(...numbers) + 1;
        }
      }
    }

    // Tính số tiếp theo (bao gồm offset và số đã dùng trong session)
    let finalNumber = this.nextNumber + offset;
    
    // Đảm bảo không trùng với số đã dùng trong session
    while (this.usedNumbers.has(finalNumber)) {
      finalNumber++;
    }

    // Đánh dấu số này đã dùng
    this.usedNumbers.add(finalNumber);

    // Cập nhật nextNumber cho lần sau
    if (offset === 0) {
      this.nextNumber = finalNumber + 1;
    }

    return `${fullPrefix}-${String(finalNumber).padStart(3, '0')}`;
  }

  /**
   * Reset generator (dùng khi đóng modal)
   */
  reset() {
    this.usedNumbers.clear();
  }

  /**
   * Lấy số tiếp theo mà không generate
   */
  peekNext() {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fullPrefix = `${this.prefix}${dateStr}`;
    return `${fullPrefix}-${String(this.nextNumber).padStart(3, '0')}`;
  }
}

// Export instances
export const salesInvoiceGenerator = new InvoiceNumberGenerator('HD');
export const purchaseInvoiceGenerator = new InvoiceNumberGenerator('PN');

export default InvoiceNumberGenerator;
