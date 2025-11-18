const Supplier = require("../models/supplier");

// Lấy tất cả nhà cung cấp
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy nhà cung cấp theo ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.getById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo nhà cung cấp mới
exports.createSupplier = async (req, res) => {
  try {
    const result = await Supplier.create(req.body);
    res.json({ 
      message: "Tạo nhà cung cấp thành công!", 
      id: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật nhà cung cấp
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.getById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    await Supplier.update(id, req.body);
    res.json({ message: "Cập nhật nhà cung cấp thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa nhà cung cấp
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.getById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    await Supplier.delete(id);
    res.json({ message: "Xóa nhà cung cấp thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



