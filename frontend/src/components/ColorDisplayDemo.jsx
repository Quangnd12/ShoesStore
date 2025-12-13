import ColorDisplay, { MultiColorDisplay, ColorWithQuantity } from "./ColorDisplay";

const ColorDisplayDemo = () => {
  const sampleColors = [
    "đen", "trắng", "xám", "đỏ", "xanh dương", "xanh lá", 
    "vàng", "cam", "tím", "hồng", "nâu", "#3c3c3c", "#ff6b6b"
  ];

  const multiColors = ["đen", "trắng", "xanh dương", "đỏ", "vàng"];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Demo: Hiển thị màu sắc sản phẩm
      </h1>

      {/* Single Color Display - Different Sizes */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">ColorDisplay - Các kích thước</h2>
        <div className="grid grid-cols-5 gap-4">
          {["xs", "sm", "md", "lg", "xl"].map(size => (
            <div key={size} className="text-center">
              <h3 className="text-sm font-medium mb-2 capitalize">{size}</h3>
              <ColorDisplay 
                color="đỏ" 
                size={size} 
                showLabel={true}
                style="circle"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Different Styles */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">ColorDisplay - Các kiểu hiển thị</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium mb-2">Circle</h3>
            <ColorDisplay 
              color="xanh dương" 
              size="lg" 
              showLabel={true}
              style="circle"
            />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium mb-2">Square</h3>
            <ColorDisplay 
              color="xanh dương" 
              size="lg" 
              showLabel={true}
              style="square"
            />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium mb-2">Inline</h3>
            <ColorDisplay 
              color="xanh dương" 
              size="lg" 
              showLabel={true}
              style="inline"
            />
          </div>
        </div>
      </section>

      {/* All Sample Colors */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Tất cả màu sắc hỗ trợ</h2>
        <div className="grid grid-cols-6 gap-4">
          {sampleColors.map((color, index) => (
            <ColorDisplay 
              key={index}
              color={color} 
              size="md" 
              showLabel={true}
              style="circle"
            />
          ))}
        </div>
      </section>

      {/* Multi Color Display */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">MultiColorDisplay - Nhiều màu</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Hiển thị tối đa 3 màu</h3>
            <MultiColorDisplay 
              colors={multiColors} 
              size="md" 
              maxDisplay={3}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Hiển thị tất cả màu</h3>
            <MultiColorDisplay 
              colors={multiColors} 
              size="sm" 
              maxDisplay={10}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Không có màu</h3>
            <MultiColorDisplay 
              colors={[]} 
              size="md" 
              maxDisplay={3}
            />
          </div>
        </div>
      </section>

      {/* Color with Quantity */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">ColorWithQuantity - Màu với số lượng</h2>
        <div className="grid grid-cols-2 gap-4">
          <ColorWithQuantity 
            color="đen" 
            quantity={25}
            size="md"
          />
          <ColorWithQuantity 
            color="trắng" 
            quantity={12}
            size="md"
          />
          <ColorWithQuantity 
            color="#3c3c3c" 
            quantity={8}
            size="md"
          />
          <ColorWithQuantity 
            color="" 
            quantity={0}
            size="md"
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Các trường hợp sử dụng</h2>
        
        {/* Product Card Example */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Trong ProductCard</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <ColorDisplay color="đen" size="sm" showLabel={false} style="circle" />
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">42</span>
              <span className="text-sm font-bold ml-auto">2,500,000₫</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="capitalize">Đen</span>
              <span className="font-medium">Nike</span>
            </div>
          </div>
        </div>

        {/* Cart Item Example */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Trong CartItem</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <ColorDisplay color="xanh dương" size="xs" showLabel={false} style="circle" />
              <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Size: 42</span>
              <span className="text-xs text-gray-600 ml-auto">2,500,000₫</span>
            </div>
          </div>
        </div>

        {/* Product Table Example */}
        <div>
          <h3 className="text-sm font-medium mb-2">Trong bảng sản phẩm</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sản phẩm</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Màu sắc</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Giá</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">Nike Air Max 270</td>
                  <td className="px-4 py-3">
                    <MultiColorDisplay colors={["đen", "trắng", "xanh dương"]} size="sm" maxDisplay={3} />
                  </td>
                  <td className="px-4 py-3">2,500,000₫</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Special Cases */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Trường hợp đặc biệt</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Màu trắng (có viền)</h3>
            <ColorDisplay color="trắng" size="lg" showLabel={true} style="circle" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Màu hex</h3>
            <ColorDisplay color="#3c3c3c" size="lg" showLabel={true} style="circle" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Không có màu</h3>
            <ColorDisplay color="" size="lg" showLabel={true} style="circle" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorDisplayDemo;