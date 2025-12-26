const ReturnExchange = require("../models/returnExchange");

// Tạo yêu cầu hoàn trả/đổi hàng
exports.createReturnExchange = async (req, res) => {
  try {
    const { sales_invoice_id, type, reason, items, notes } = req.body;

    if (!sales_invoice_id || !type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Vui lòng cung cấp: sales_invoice_id, type ('return' hoặc 'exchange'), và items",
      });
    }

    if (type !== "return" && type !== "exchange") {
      return res.status(400).json({
        message: "type phải là 'return' (hoàn trả) hoặc 'exchange' (đổi hàng)",
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.sales_invoice_item_id || !item.quantity) {
        return res.status(400).json({
          message: "Mỗi item cần có sales_invoice_item_id và quantity",
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          message: "quantity phải lớn hơn 0",
        });
      }
      if (type === "exchange" && !item.new_product_id) {
        return res.status(400).json({
          message: "Khi đổi hàng, mỗi item cần có new_product_id",
        });
      }
    }

    const result = await ReturnExchange.create({
      sales_invoice_id,
      type,
      reason,
      items,
      notes,
    });

    res.json({
      message: type === "return" ? "Hoàn trả hàng thành công!" : "Đổi hàng thành công!",
      return_exchange_id: result.id,
      revenue_difference: result.revenue_difference,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả yêu cầu hoàn trả/đổi
exports.getAllReturnExchanges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const returnExchanges = await ReturnExchange.getAll(limit, offset);
    const total = await ReturnExchange.getTotal();

    res.json({
      return_exchanges: returnExchanges,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết hoàn trả/đổi
exports.getReturnExchangeById = async (req, res) => {
  try {
    const { id } = req.params;
    const returnExchange = await ReturnExchange.getById(id);
    if (!returnExchange) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu hoàn trả/đổi" });
    }
    const items = await ReturnExchange.getItems(id);
    res.json({ ...returnExchange, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};