import React, { useState, useCallback, useEffect, useRef } from 'react';
import '../../styles/viewer.css';
import { getBasePath } from '../../utils/imageUtils';
import { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface DocumentViewerProps {
  documentUrl: string;
  filename?: string;
  mimeType?: string;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentUrl, 
  filename = '文档', 
  mimeType, 
  onClose 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // 获取完整文档URL
  const getFullDocumentUrl = useCallback(() => {
    console.log('原始文档URL:', documentUrl);
    // 检查是否已经是完整URL
    if (documentUrl.startsWith('http') || documentUrl.startsWith('data:')) {
      console.log('使用完整URL:', documentUrl);
      return documentUrl;
    }
    
    // 添加基础路径
    const basePath = getBasePath();
    const fullUrl = `${basePath}${documentUrl}`;
    console.log('处理后的文档URL:', fullUrl, '基础路径:', basePath);
    
    return fullUrl;
  }, [documentUrl]);
  
  // 完整文档URL
  const fullDocumentUrl = getFullDocumentUrl();
  
  // 预加载图片
  useEffect(() => {
    // 只针对图片类型进行预加载
    if (mimeType?.startsWith('image/')) {
      console.log('开始预加载图片:', fullDocumentUrl);
      setLoading(true);
      setError(false);
      setErrorDetails('');
      
      const img = new Image();
      
      img.onload = () => {
        console.log('图片加载成功:', fullDocumentUrl);
        setLoading(false);
      };
      
      img.onerror = (e) => {
        console.error('图片加载失败:', fullDocumentUrl, e);
        
        // 尝试不同的文件扩展名
        const tryAlternateFormats = () => {
          if (fullDocumentUrl.endsWith('.jpg') || fullDocumentUrl.endsWith('.jpeg')) {
            // 尝试PNG格式
            const pngUrl = fullDocumentUrl.replace(/\.jpe?g$/, '.png');
            console.log('尝试加载PNG格式:', pngUrl);
            
            const pngImg = new Image();
            pngImg.onload = () => {
              console.log('PNG格式加载成功:', pngUrl);
              if (imageRef.current) {
                imageRef.current.src = pngUrl;
              }
              setLoading(false);
              setError(false);
            };
            
            pngImg.onerror = () => {
              console.error('PNG格式也加载失败');
              setLoading(false);
              setError(true);
              setErrorDetails(`无法加载图片: ${fullDocumentUrl} 和 ${pngUrl}`);
            };
            
            pngImg.src = pngUrl;
          } else if (fullDocumentUrl.endsWith('.png')) {
            // 尝试JPG格式
            const jpgUrl = fullDocumentUrl.replace(/\.png$/, '.jpg');
            console.log('尝试加载JPG格式:', jpgUrl);
            
            const jpgImg = new Image();
            jpgImg.onload = () => {
              console.log('JPG格式加载成功:', jpgUrl);
              if (imageRef.current) {
                imageRef.current.src = jpgUrl;
              }
              setLoading(false);
              setError(false);
            };
            
            jpgImg.onerror = () => {
              console.error('JPG格式也加载失败');
              setLoading(false);
              setError(true);
              setErrorDetails(`无法加载图片: ${fullDocumentUrl} 和 ${jpgUrl}`);
            };
            
            jpgImg.src = jpgUrl;
          } else {
            setLoading(false);
            setError(true);
            setErrorDetails(`无法加载图片: ${fullDocumentUrl}`);
          }
        };
        
        tryAlternateFormats();
      };
      
      // 添加时间戳防止缓存问题
      const timestamp = new Date().getTime();
      img.src = `${fullDocumentUrl}?t=${timestamp}`;
      
    } else {
      // 对于非图片类型，不进行预加载
      console.log('非图片类型文档，跳过预加载:', mimeType);
      setLoading(false);
    }
  }, [fullDocumentUrl, mimeType]);
  
  // 用于React组件内的键盘事件处理
  const handleDivKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  // 用于window事件监听器的键盘事件处理
  const handleWindowKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [handleWindowKeyDown]);
  
  // 外部点击关闭
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  };

  return (
    <div 
      className="document-viewer-wrapper" 
      onClick={handleBackgroundClick}
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleDivKeyDown}
    >
      <div 
        className="document-viewer-content"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
            <p className="loading-details">正在加载: {filename}</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>文档加载失败</p>
            <p>文件: {filename || '未指定'}</p>
            <p>类型: {mimeType || '未知'}</p>
            {errorDetails && <p className="error-details">{errorDetails}</p>}
            <button onClick={onClose} className="close-button">
              关闭
            </button>
          </div>
        ) : mimeType?.startsWith('image/') ? (
          // 对图片类型使用img标签直接显示
          <div className="image-viewer">
            <img
              src={fullDocumentUrl}
              alt={filename || '文档'}
              style={{
                maxHeight: '80vh',
                maxWidth: '90vw',
              }}
              ref={imageRef}
            />
            <div className="document-controls">
              <a 
                href={fullDocumentUrl} 
                download={filename}
                className="download-button"
              >
                下载
              </a>
              <button onClick={onClose} className="close-button">
                关闭
              </button>
            </div>
          </div>
        ) : (
          // 其他类型使用PDF查看器或提供下载链接
          <div className="pdf-container">
            <div className="document-placeholder">
              <p>此文档类型不支持直接预览</p>
              <p>文件: {filename}</p>
              <p>类型: {mimeType || '未知'}</p>
              <div className="document-controls">
                <a 
                  href={fullDocumentUrl} 
                  download={filename}
                  className="download-button"
                >
                  下载
                </a>
                <button onClick={onClose} className="close-button">
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer; 