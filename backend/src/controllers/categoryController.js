const Category = require("../models/category");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await Category.create(name);
    res.json({ message: "Tạo danh mục thành công", id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    await Category.update(req.params.id, name);
    res.json({ message: "Cập nhật danh mục thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.json({ message: "Xóa danh mục thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
