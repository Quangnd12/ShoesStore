const SalesInvoice = require("../models/salesInvoice");

// Tạo hóa đơn bán hàng trực tiếp
exports.createSalesInvoice = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message:
          "Request body không được để trống. Vui lòng gửi dữ liệu JSON hợp lệ.",
      });
    }

    const {
      invoice_number,
      invoice_date,
      notes,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      items,
    } = req.body;

    if (!invoice_number) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp invoice_number" });
    }

    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp danh sách items (product_id, quantity, unit_price?).",
      });
    }

    const result = await SalesInvoice.create({
      invoice_number,
      invoice_date,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      items,
      notes,
    });

    res.json({
      message: "Tạo hóa đơn bán hàng thành công!",
      invoice_id: result.id,
      total_revenue: result.total_revenue,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả hóa đơn bán
exports.getAllSalesInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const invoices = await SalesInvoice.getAll(limit, offset);
    const total = await SalesInvoice.getTotal();

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

// Lấy chi tiết hóa đơn bán
exports.getSalesInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await SalesInvoice.getById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn bán" });
    }
    const items = await SalesInvoice.getItems(id);
    const returnExchanges = await SalesInvoice.getReturnExchanges(id);
    res.json({ ...invoice, items, returnExchanges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy số hóa đơn tiếp theo (tự động tăng)
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const nextNumber = await SalesInvoice.getNextInvoiceNumber();
    res.json({ invoice_number: nextNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
