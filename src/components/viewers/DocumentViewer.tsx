import React, { useState, useCallback, useEffect, useRef } from 'react';
import '../../styles/viewer.css';
import { getBasePath } from '../../utils/imageUtils';

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
    setLoading(false);
    setError(true);
  }, []);
  
  // 处理键盘事件
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
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
    <div className="viewer-overlay" onClick={handleBackgroundClick} ref={containerRef}>
      <div className="viewer-header">
        <h3 className="viewer-title">{filename}</h3>
        <button className="viewer-close-btn" onClick={onClose}>&times;</button>
      </div>
      
      <div className="viewer-content">
        {loading && !error && (
          <div className="loading-indicator">
            <div className="loader"></div>
            <span>加载中...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <span>无法预览此文档</span>
          </div>
        )}
        
        {!loading && !error && canPreview() ? (
          <div className="viewer-doc-container">
            {mimeType?.startsWith('image/') ? (
              // 对于图片类型，使用img标签而不是iframe
              <img 
                src={fullDocumentUrl}
                alt={filename}
                className="viewer-img max-w-full max-h-full object-contain"
                onLoad={handleLoad}
                onError={handleError}
                style={{
                  maxHeight: '80vh',
                  maxWidth: '90vw',
                }}
              />
            ) : (
              <iframe 
                src={fullDocumentUrl}
                title={filename}
                className="viewer-doc-frame"
                onLoad={handleLoad}
                onError={handleError}
                sandbox="allow-same-origin allow-scripts"
              />
            )}
          </div>
        ) : (
          !loading && (
            <div className="viewer-doc-fallback">
              <p>此文档类型无法在浏览器中预览</p>
              <div className="file-info">
                <span className="file-name">{filename}</span>
                {mimeType && <span className="file-type">类型: {mimeType}</span>}
                <span className="file-type">格式: {getFileExtension(filename)}</span>
              </div>
            </div>
          )
        )}
      </div>
      
      <div className="viewer-controls">
        <button 
          className="viewer-download-btn" 
          onClick={handleDownload}
        >
          下载文档
        </button>
      </div>
    </div>
  );
};

export default DocumentViewer; 