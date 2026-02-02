const Product = require("../models/product");
const db = require("../config/db");

// Helper function để lấy available sizes từ product_sizes table
const getAvailableSizes = async (productId, fallbackSizeString, fallbackStock) => {
  try {
    // Kiểm tra bảng product_sizes có tồn tại không
    const [tableCheck] = await db.execute(
      `SELECT 1 FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'product_sizes' LIMIT 1`
    );
    
    if (tableCheck.length > 0) {
      // Lấy sizes từ bảng product_sizes
      const [sizeRows] = await db.execute(
        `SELECT size_value, quantity FROM product_sizes 
         WHERE product_id = ? AND quantity > 0 
         ORDER BY size_value`,
        [productId]
      );
      
      if (sizeRows.length > 0) {
        return {
          sizes: sizeRows.map(s => s.size_value).join(', '),
          availableSizes: sizeRows.map(s => ({ size: s.size_value, quantity: s.quantity })),
          totalSizeStock: sizeRows.reduce((sum, s) => sum + s.quantity, 0)
        };
      }
    }
  } catch (error) {
    console.log('product_sizes table not available, using fallback');
  }
  
  // Fallback: parse từ cột size và chia đều stock
  if (fallbackSizeString) {
    const sizes = fallbackSizeString.split(',').map(s => s.trim()).filter(s => s);
    const qtyPerSize = Math.floor(fallbackStock / sizes.length) || 0;
    return {
      sizes: fallbackSizeString,
      availableSizes: sizes.map(s => ({ size: s, quantity: qtyPerSize })),
      totalSizeStock: fallbackStock
    };
  }
  
  return { sizes: null, availableSizes: [], totalSizeStock: fallbackStock };
};

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

    // Lấy filters từ query params
    const filters = {
      name: req.query.name || null,
      category_id: req.query.category_id || null,
      brand: req.query.brand || null,
      minPrice: req.query.minPrice || null,
      maxPrice: req.query.maxPrice || null,
      minStock: req.query.minStock || null,
      maxStock: req.query.maxStock || null,
    };

    const products = await Product.getAll(limit, offset, filters);
    const total = await Product.getTotal(filters);

    // Format lại dữ liệu sản phẩm với thông tin sizes
    const formattedProducts = await Promise.all(products.map(async (product) => {
      const sizeInfo = await getAvailableSizes(product.id, product.size, product.stock_quantity);
      
      return {
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
        size: sizeInfo.sizes, // Chỉ trả về sizes còn hàng
        availableSizes: sizeInfo.availableSizes, // Chi tiết từng size với quantity
        color: product.color || null,
      };
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

// Lấy sizes và số lượng của sản phẩm
exports.getProductSizes = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductSize = require("../models/productSize");
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.getById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Kiểm tra bảng product_sizes có tồn tại không
    const tableExists = await ProductSize.tableExists();
    
    if (tableExists) {
      // Lấy sizes từ bảng product_sizes
      const sizes = await ProductSize.getByProductId(id);
      
      if (sizes.length > 0) {
        return res.json({
          product_id: parseInt(id),
          product_name: product.name,
          sizes: sizes.map(s => ({
            size: s.size_value,
            quantity: s.quantity,
            available: s.quantity > 0
          })),
          total_quantity: sizes.reduce((sum, s) => sum + s.quantity, 0)
        });
      }
    }
    
    // Fallback: parse từ cột size của product và chia đều stock_quantity
    if (product.size) {
      const sizeList = product.size.split(',').map(s => s.trim()).filter(s => s);
      const qtyPerSize = Math.floor(product.stock_quantity / sizeList.length) || 0;
      
      return res.json({
        product_id: parseInt(id),
        product_name: product.name,
        sizes: sizeList.map(s => ({
          size: s,
          quantity: qtyPerSize,
          available: qtyPerSize > 0
        })),
        total_quantity: product.stock_quantity,
        note: "Số lượng được chia đều từ stock_quantity (chưa có dữ liệu chi tiết theo size)"
      });
    }
    
    // Sản phẩm không có size
    return res.json({
      product_id: parseInt(id),
      product_name: product.name,
      sizes: [],
      total_quantity: product.stock_quantity
    });
    
  } catch (err) {
    console.error("Error getting product sizes:", err);
    res.status(500).json({ message: err.message });
  }
};
