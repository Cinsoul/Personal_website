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
    
    // 确保路径格式正确
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${basePath}${normalizedPath}`;
    
    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${fullUrl}?t=${timestamp}`;
    
    console.log('构建完整URL:', {
      原始URL: imageUrl,
      basePath: basePath,
      正规化路径: normalizedPath,
      完整URL: fullUrl,
      带时间戳URL: urlWithTimestamp
    });
    
    return urlWithTimestamp;
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
      
      // 系列化尝试不同路径格式
      const tryPaths = [
        // 1. 尝试不带斜杠的路径
        `${basePath}${imageUrl.replace(/^\//, '')}?t=${new Date().getTime()}`,
        // 2. 尝试添加斜杠的路径
        `${basePath}/${imageUrl.replace(/^\//, '')}?t=${new Date().getTime()}`,
        // 3. 尝试public目录
        `${basePath}/public/${imageUrl.replace(/^\//, '')}?t=${new Date().getTime()}`,
        // 4. 尝试移除Personal_website部分（避免重复）
        ...(imageUrl.includes('/Personal_website/') 
          ? [`${imageUrl.replace('/Personal_website/', '/')}?t=${new Date().getTime()}`]
          : []),
        // 5. 默认回退图标
        `${basePath}/vite.svg`
      ];
      
      console.log('开始尝试备用路径系列:', tryPaths);
      
      // 递归尝试路径
      const tryNextPath = (index = 0) => {
        if (index >= tryPaths.length) {
          console.error('所有备用路径均失败');
          setError(true);
          return;
        }
        
        const path = tryPaths[index];
        console.log(`尝试备用路径 ${index+1}/${tryPaths.length}:`, path);
        
        if (imageRef.current) {
          imageRef.current.onload = () => {
            console.log('备用路径加载成功:', path);
            setError(false);
          };
          
          imageRef.current.onerror = () => {
            console.log('备用路径失败:', path);
            tryNextPath(index + 1);
          };
          
          imageRef.current.src = path;
        }
      };
      
      tryNextPath();
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