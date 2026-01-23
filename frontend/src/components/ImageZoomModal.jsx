import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

const ImageZoomModal = ({ isOpen, onClose, imageUrl, altText = "Hình ảnh" }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Xử lý phím tắt
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
        case '0':
          handleReset();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'IMG') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          title="Thu nhỏ (-)"
        >
          <ZoomOut size={20} />
        </button>
        
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          title="Phóng to (+)"
        >
          <ZoomIn size={20} />
        </button>
        
        <div className="w-px h-6 bg-white bg-opacity-30"></div>
        
        <button
          onClick={handleRotate}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          title="Xoay (R)"
        >
          <RotateCw size={20} />
        </button>
        
        <button
          onClick={handleDownload}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          title="Tải xuống"
        >
          <Download size={20} />
        </button>
        
        <button
          onClick={handleReset}
          className="px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          title="Đặt lại (0)"
        >
          Reset
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors z-10"
        title="Đóng (Esc)"
      >
        <X size={24} />
      </button>

      {/* Image container */}
      <div 
        className="w-full h-full flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-none max-h-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          draggable={false}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center bg-black bg-opacity-50 rounded-lg px-4 py-2">
        <div>Kéo để di chuyển • Cuộn chuột để zoom • Phím tắt: +/- (zoom), R (xoay), 0 (reset), Esc (đóng)</div>
      </div>
    </div>
  );
};

export default ImageZoomModal;