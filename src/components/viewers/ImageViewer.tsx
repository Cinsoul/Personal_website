import { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/viewer.css';
import { getBasePath } from '../../utils/imageUtils';

interface ImageViewerProps {
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, altText = '', onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取完整图片URL
  const getFullImageUrl = useCallback(() => {
    console.log('处理图片URL:', imageUrl);
    // 检查是否已经是完整URL
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
      console.log('使用原始URL:', imageUrl);
      return imageUrl;
    }
    
    // 添加基础路径
    const basePath = getBasePath();
    const fullUrl = imageUrl.startsWith('/') 
      ? `${basePath}${imageUrl}` 
      : `${basePath}/${imageUrl}`;
    console.log('构建完整URL:', fullUrl, '基础路径:', basePath);
    
    return fullUrl;
  }, [imageUrl]);

  // 处理图片加载
  const handleImageLoad = () => {
    console.log('图片加载成功:', getFullImageUrl());
    setLoading(false);
  };

  // 处理图片加载错误
  const handleImageError = () => {
    console.error('图片加载失败:', getFullImageUrl());
    setLoading(false);
    setError(true);
    
    // 尝试不同的URL格式
    if (imageRef.current && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
      const basePath = getBasePath();
      // 尝试不带斜杠的路径
      if (imageUrl.startsWith('/')) {
        const altUrl = `${basePath}${imageUrl.slice(1)}`;
        console.log('尝试不带斜杠的路径:', altUrl);
        imageRef.current.src = altUrl;
        
        // 如果还失败，最后尝试使用默认图标
        imageRef.current.onerror = () => {
          console.log('备用路径也失败，使用默认图标');
          imageRef.current!.src = `${basePath}/vite.svg`;
          // 如果默认图标加载失败，显示错误状态
          imageRef.current!.onerror = () => setError(true);
        };
        return;
      }
      
      // 尝试添加斜杠的路径
      if (!imageUrl.startsWith('/')) {
        const altUrl = `${basePath}/${imageUrl}`;
        console.log('尝试添加斜杠的路径:', altUrl);
        imageRef.current.src = altUrl;
        
        // 如果还失败，最后尝试使用默认图标
        imageRef.current.onerror = () => {
          console.log('备用路径也失败，使用默认图标');
          imageRef.current!.src = `${basePath}/vite.svg`;
          // 如果默认图标加载失败，显示错误状态
          imageRef.current!.onerror = () => setError(true);
        };
        return;
      }
    }
  };

  // 重置图片大小和位置
  const resetImage = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 缩放图片
  const zoomImage = (factor: number) => {
    setScale(prevScale => {
      const newScale = prevScale * factor;
      // 限制缩放范围
      if (newScale < 0.5) return 0.5;
      if (newScale > 5) return 5;
      return newScale;
    });
  };

  // 拖动图片
  const startDrag = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const onDrag = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const stopDrag = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomImage(factor);
  }, []);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        zoomImage(1.1);
        break;
      case '-':
        zoomImage(0.9);
        break;
      case '0':
        resetImage();
        break;
      default:
        break;
    }
  }, [onClose]);

  // 下载图片
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = getFullImageUrl();
    link.download = altText || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 点击背景关闭
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  };

  // 监听全局事件
  useEffect(() => {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('keydown', handleKeyDown);
    
    // 为容器添加滚轮事件监听
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (currentContainer) {
        currentContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, [onDrag, handleKeyDown, handleWheel]);

  // 完整图片URL
  const fullImageUrl = getFullImageUrl();

  return (
    <div className="viewer-overlay" ref={containerRef} onClick={handleBackgroundClick}>
      <div className="viewer-header">
        <h3 className="viewer-title">{altText || '图片'}</h3>
        <button className="viewer-close-btn" onClick={onClose}>&times;</button>
      </div>
      
      <div className="viewer-content">
        {loading && (
          <div className="loading-indicator">
            <div className="loader"></div>
            <span>加载中...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">图片加载失败</div>
        )}
        
        {!loading && !error && (
          <div className={`viewer-img-container ${isDragging ? 'grabbing' : 'grab'}`}>
            <img
              ref={imageRef}
              className="viewer-img"
              src={fullImageUrl}
              alt={altText}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
              onMouseDown={startDrag}
            />
          </div>
        )}
      </div>
      
      <div className="viewer-controls">
        <button onClick={() => zoomImage(1.1)}>放大</button>
        <button onClick={() => zoomImage(0.9)}>缩小</button>
        <button onClick={resetImage}>重置</button>
        <button onClick={downloadImage} className="viewer-download-btn">下载</button>
      </div>
    </div>
  );
};

export default ImageViewer; 