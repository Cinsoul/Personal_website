import React, { useEffect, useState } from 'react';

interface ImageViewerProps {
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

/**
 * 图片查看器组件
 * 用于点击查看大图
 */
const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, title, onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(1);
  
  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setScale(prev => Math.min(prev + 0.1, 3)); // 最大放大3倍
      } else if (e.key === '-') {
        setScale(prev => Math.max(prev - 0.1, 0.5)); // 最小缩小0.5倍
      } else if (e.key === '0') {
        setScale(1); // 重置到原始大小
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setIsLoaded(true);
  };
  
  // 放大
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  // 缩小
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // 重置
  const resetZoom = () => {
    setScale(1);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      {/* 关闭按钮 */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
        aria-label="关闭"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* 标题 */}
      {title && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>
      )}
      
      {/* 缩放控制 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg flex items-center px-2">
        <button 
          onClick={zoomOut}
          className="text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
          title="缩小"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <span className="text-white px-2">{Math.round(scale * 100)}%</span>
        
        <button 
          onClick={resetZoom}
          className="text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
          title="重置大小"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <button 
          onClick={zoomIn}
          className="text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
          title="放大"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {/* 图片容器 */}
      <div 
        className={`relative flex items-center justify-center w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      >
        {/* 加载指示器 */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        {/* 显示图片 */}
        {!imageError ? (
          <img 
            src={imageUrl} 
            alt={title || '图片预览'} 
            className="max-w-[90vw] max-h-[90vh] object-contain cursor-move transition-transform duration-300 ease-out"
            style={{ transform: `scale(${scale})` }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={(e) => e.stopPropagation()} // 防止点击图片时关闭
          />
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white text-lg">图片加载失败</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer; 