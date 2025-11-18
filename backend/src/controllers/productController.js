const Product = require("../models/product");

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Kiểm tra nếu limit hoặc offset là undefined
    if (isNaN(limit) || isNaN(offset)) {
      return res
        .status(400)
        .json({ message: "Invalid page or limit parameters" });
    }

    const products = await Product.getAll(limit, offset);
    const total = await Product.getTotal();

    // Format lại dữ liệu sản phẩm
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url,
      category: {
        id: product.category_id,
        name: product.category_name,
      },
      status: product.stock_quantity > 0 ? "Còn hàng" : "Hết hàng",
      created_at: product.created_at,
      updated_at: product.updated_at,
      discount_price: product.discount_price || null,
      brand: product.brand || null,
      size: product.size || null,
      color: product.color || null,
    }));

    res.json({
      products: formattedProducts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Thêm sản phẩm mới
exports.addProduct = async (req, res) => {
  try {
    const result = await Product.create(req.body);
    res.json({ message: "Thêm sản phẩm thành công!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    await Product.update(id, req.body);
    res.json({ message: "Cập nhật sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    await Product.delete(id);
    res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tìm kiếm sản phẩm
exports.searchProducts = async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;
    const offset = (page - 1) * limit;

    const products = await Product.search({
      query,
      category,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    const total = await Product.getSearchTotal({
      query,
      category,
      minPrice,
      maxPrice,
    });

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const products = await Product.getByCategory(categoryId, limit, offset);
    const total = await Product.getTotalByCategory(categoryId);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Nhập hàng theo túi: tạo nhiều products cùng tên nhưng khác size
exports.createProductBatch = async (req, res) => {
  try {
    // Kiểm tra req.body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message:
          "Request body không được để trống. Vui lòng gửi dữ liệu với Content-Type: application/json",
      });
    }

    const {
      name,
      description,
      price,
      category_id,
      image_url,
      discount_price,
      brand,
      color,
      sizes, // [{size_eu, stock_quantity}]
    } = req.body;

    if (
      !name ||
      !price ||
      !category_id ||
      !sizes ||
      !Array.isArray(sizes) ||
      sizes.length === 0
    ) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp đầy đủ: name, price, category_id, và danh sách sizes (size_eu, stock_quantity)",
        received: {
          hasName: !!name,
          hasPrice: !!price,
          hasCategoryId: !!category_id,
          hasSizes: !!sizes,
          sizesIsArray: Array.isArray(sizes),
          sizesLength: sizes?.length || 0,
        },
      });
    }

    // Validate sizes
    for (const size of sizes) {
      if (
        !size.size_eu ||
        size.stock_quantity === undefined ||
        size.stock_quantity < 0
      ) {
        return res.status(400).json({
          message: "Mỗi size cần có size_eu và stock_quantity >= 0",
        });
      }
      if (size.size_eu < 30 || size.size_eu > 50) {
        return res.status(400).json({
          message: "Size EU phải trong khoảng 30-50",
        });
      }
    }

    const baseProduct = {
      name,
      description,
      price,
      category_id,
      image_url,
      discount_price,
      brand,
      color,
    };

    const results = await Product.createBatch(baseProduct, sizes);
    res.json({
      message: "Nhập hàng thành công!",
      products_created: results.length,
      sizes: sizes.map((s) => s.size_eu),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả size của một sản phẩm (theo tên)
exports.getProductsByName = async (req, res) => {
  try {
    const { name } = req.params;
    const products = await Product.getByProductName(name);
    res.json({ name, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
