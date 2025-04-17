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
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // 获取完整文档URL
  const getFullDocumentUrl = useCallback(() => {
    // 检查是否已经是完整URL
    if (documentUrl.startsWith('http') || documentUrl.startsWith('data:')) {
      console.log('使用完整URL:', documentUrl);
      return documentUrl;
    }
    
    // 添加基础路径
    const basePath = getBasePath();
    const fullUrl = `${basePath}${documentUrl}`;
    console.log('处理后的文档URL:', fullUrl, '基础路径:', basePath);
    
    // 如果是图片类型，确保URL没有特殊字符
    if (mimeType?.startsWith('image/')) {
      // 为图片URL添加时间戳，避免缓存问题
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${fullUrl}?t=${timestamp}`;
      console.log('添加时间戳后的图片URL:', urlWithTimestamp);
      return urlWithTimestamp;
    }
    
    return fullUrl;
  }, [documentUrl, mimeType]);
  
  // 判断是否可以在浏览器中预览
  const canPreview = useCallback((): boolean => {
    if (!mimeType) return false;
    
    // 常见可预览的文档类型
    const previewableMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'text/plain',
      'text/html',
      'text/csv'
    ];
    
    return previewableMimeTypes.includes(mimeType);
  }, [mimeType]);
  
  // 处理下载
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = getFullDocumentUrl();
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getFullDocumentUrl, filename]);
  
  // 处理加载完成
  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);
  
  // 处理加载错误
  const handleError = useCallback(() => {
    console.error('文档加载失败:', {
      url: getFullDocumentUrl(),
      type: mimeType,
      filename
    });
    
    // 如果是图片类型，尝试其他扩展名
    if (mimeType?.startsWith('image/')) {
      const currentSrc = getFullDocumentUrl();
      
      // 尝试不同的文件扩展名
      if (currentSrc.endsWith('.jpg') || currentSrc.endsWith('.jpeg')) {
        // 尝试PNG格式
        const pngSrc = currentSrc.replace(/\.jpe?g$/, '.png');
        console.log('尝试加载PNG格式:', pngSrc);
        
        // 创建新的Image对象预加载
        const imgTest = new Image();
        imgTest.onload = () => {
          console.log('找到可用的PNG格式:', pngSrc);
          if (imageRef.current) {
            imageRef.current.src = pngSrc;
            // 重置错误状态
            setError(false);
            return;
          }
        };
        imgTest.onerror = () => {
          // PNG也不存在，设置错误状态
          console.error('PNG格式也无法加载');
          setError(true);
        };
        imgTest.src = pngSrc;
        return; // 等待新图片加载，暂不设置错误状态
      } else if (currentSrc.endsWith('.png')) {
        // 尝试JPG格式
        const jpgSrc = currentSrc.replace(/\.png$/, '.jpg');
        console.log('尝试加载JPG格式:', jpgSrc);
        
        const imgTest = new Image();
        imgTest.onload = () => {
          console.log('找到可用的JPG格式:', jpgSrc);
          if (imageRef.current) {
            imageRef.current.src = jpgSrc;
            // 重置错误状态
            setError(false);
            return;
          }
        };
        imgTest.onerror = () => {
          console.error('JPG格式也无法加载');
          setError(true);
        };
        imgTest.src = jpgSrc;
        return; // 等待新图片加载，暂不设置错误状态
      }
    }
    
    // 无法恢复，设置错误状态
    setLoading(false);
    setError(true);
  }, [getFullDocumentUrl, mimeType, filename]);
  
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

  // 获取文件扩展名（用于显示）
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  // 完整文档URL
  const fullDocumentUrl = getFullDocumentUrl();

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
          </div>
        ) : error ? (
          <div className="error-container">
            <p>文档加载失败</p>
            <p>文件: {filename || '未指定'}</p>
            <p>类型: {mimeType || '未知'}</p>
            <button onClick={onClose} className="close-button">
              关闭
            </button>
          </div>
        ) : mimeType?.startsWith('image/') ? (
          // 对图片类型使用img标签直接显示
          <div className="image-viewer">
            <img
              src={`${fullDocumentUrl}?v=${Date.now()}`} // 添加时间戳防止缓存
              alt={filename || '文档'}
              style={{
                maxHeight: '80vh',
                maxWidth: '90vw',
              }}
              ref={imageRef}
              onError={handleError}
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
          // 其他类型使用PDF查看器
          <div className="pdf-container">
            {/* 这里使用了react-pdf无需修改 */}
            {/* ... existing code ... */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer; 