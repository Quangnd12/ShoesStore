const PurchaseInvoice = require("../models/purchaseInvoice");

// Tạo hóa đơn nhập hàng (hỗ trợ cả tạo sản phẩm mới)
exports.createPurchaseInvoice = async (req, res) => {
  try {
    const { invoice_number, supplier_id, invoice_date, items, notes } = req.body;

    if (!invoice_number || !supplier_id || !invoice_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp đầy đủ: invoice_number, supplier_id, invoice_date, items" 
      });
    }

    // Validate items
    for (const item of items) {
      // Trường hợp 1: Sản phẩm đã tồn tại
      if (item.product_id) {
        if (!item.quantity || !item.unit_cost) {
          return res.status(400).json({ 
            message: "Sản phẩm đã tồn tại cần có: product_id, quantity, unit_cost" 
          });
        }
      }
      // Trường hợp 2: Sản phẩm mới
      else if (item.name) {
        if (!item.price || !item.category_id || !item.quantity || !item.unit_cost) {
          return res.status(400).json({ 
            message: "Sản phẩm mới cần có: name, price, category_id, quantity, unit_cost" 
          });
        }
      }
      // Không hợp lệ
      else {
        return res.status(400).json({ 
          message: "Mỗi item phải có product_id (sản phẩm đã tồn tại) HOẶC name (sản phẩm mới)" 
        });
      }

      if (item.quantity <= 0 || item.unit_cost <= 0) {
        return res.status(400).json({ 
          message: "quantity và unit_cost phải lớn hơn 0" 
        });
      }
    }

    const created_by = req.user?.id || null;
    const result = await PurchaseInvoice.create({
      invoice_number,
      supplier_id,
      invoice_date,
      items,
      notes,
      created_by,
    });

    res.json({ 
      message: "Tạo hóa đơn nhập hàng thành công!", 
      invoice_id: result.id,
      total_cost: result.total_cost,
      products_created: result.products_created
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả hóa đơn nhập
exports.getAllPurchaseInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const invoices = await PurchaseInvoice.getAll(limit, offset);
    const total = await PurchaseInvoice.getTotal();

    res.json({
      invoices,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết hóa đơn nhập
exports.getPurchaseInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await PurchaseInvoice.getById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn nhập" });
    }
    const items = await PurchaseInvoice.getItems(id);
    res.json({ ...invoice, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa hóa đơn nhập
exports.deletePurchaseInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await PurchaseInvoice.getById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn nhập" });
    }
    await PurchaseInvoice.delete(id);
    res.json({ message: "Xóa hóa đơn nhập thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy số hóa đơn tiếp theo (tự động tăng)
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const nextNumber = await PurchaseInvoice.getNextInvoiceNumber();
    res.json({ invoice_number: nextNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Import nhiều hóa đơn nhập hàng từ Excel
exports.importPurchaseInvoices = async (req, res) => {
  try {
    const { invoices } = req.body;

    if (!invoices || !Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp danh sách hóa đơn để import" 
      });
    }

    const results = [];
    const errors = [];
    const created_by = req.user?.id || null;

    for (let i = 0; i < invoices.length; i++) {
      const invoiceData = invoices[i];
      try {
        // Validate từng hóa đơn
        const { invoice_number, supplier_id, invoice_date, items, notes } = invoiceData;

        if (!invoice_number || !supplier_id || !invoice_date || !items || !Array.isArray(items) || items.length === 0) {
          throw new Error(`Hóa đơn ${i + 1}: Thiếu thông tin bắt buộc (invoice_number, supplier_id, invoice_date, items)`);
        }

        // Validate items
        for (const item of items) {
          if (item.product_id) {
            if (!item.quantity || !item.unit_cost) {
              throw new Error(`Hóa đơn ${i + 1}: Sản phẩm đã tồn tại cần có quantity, unit_cost`);
            }
          } else if (item.name) {
            if (!item.price || !item.category_id || !item.quantity || !item.unit_cost) {
              throw new Error(`Hóa đơn ${i + 1}: Sản phẩm mới cần có name, price, category_id, quantity, unit_cost`);
            }
          } else {
            throw new Error(`Hóa đơn ${i + 1}: Mỗi item phải có product_id HOẶC name`);
          }

          if (item.quantity <= 0 || item.unit_cost <= 0) {
            throw new Error(`Hóa đơn ${i + 1}: quantity và unit_cost phải lớn hơn 0`);
          }
        }

        // Tạo hóa đơn
        const result = await PurchaseInvoice.create({
          invoice_number,
          supplier_id,
          invoice_date,
          items,
          notes,
          created_by,
        });

        results.push({
          invoice_number,
          invoice_id: result.id,
          total_cost: result.total_cost,
          products_created: result.products_created,
          status: 'success'
        });

      } catch (error) {
        errors.push({
          invoice_number: invoiceData.invoice_number || `Hóa đơn ${i + 1}`,
          error: error.message,
          status: 'error'
        });
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    res.json({
      message: `Import hoàn tất: ${successCount} thành công, ${errorCount} thất bại`,
      success_count: successCount,
      error_count: errorCount,
      results,
      errors
    });

  } catch (err) {
    console.error("Import Error:", err);
    res.status(500).json({ message: err.message });
  }
};