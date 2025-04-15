import React, { useState, useEffect, useCallback } from 'react';
import { IoClose, IoDownload } from 'react-icons/io5';
import '../../styles/viewer.css';

interface DocViewerProps {
  docUrl: string;
  docType: string;
  fileName: string;
  title?: string;
  onClose: () => void;
}

const DocViewer: React.FC<DocViewerProps> = ({
  docUrl,
  docType,
  fileName,
  title = '文档查看器',
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 处理键盘事件（按ESC键关闭查看器）
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // 下载文档
  const downloadDoc = () => {
    const link = document.createElement('a');
    link.href = docUrl;
    link.download = fileName || '文档';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 判断文档是否可以预览（PDF可以直接预览）
  const isPdfViewable = docType === 'application/pdf';

  // 处理PDF加载完成
  const handleDocLoad = () => {
    setIsLoading(false);
  };

  // 处理PDF加载错误
  const handleDocError = () => {
    setIsLoading(false);
    setError('文档加载失败，请尝试下载查看');
  };

  useEffect(() => {
    // 一些文档类型无法预览，直接提供下载选项
    if (!isPdfViewable) {
      setIsLoading(false);
    }

    // 组件挂载时添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    
    // 组件卸载时移除键盘事件监听
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isPdfViewable]);
  
  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-header">
        <h3 className="viewer-title">{title}</h3>
        <button 
          className="viewer-close-btn" 
          onClick={onClose}
          aria-label="关闭"
        >
          <IoClose />
        </button>
      </div>
      
      <div 
        className="viewer-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="loading-indicator">
            <div className="loader"></div>
            <div>正在加载文档...</div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
            <button 
              className="viewer-download-btn" 
              onClick={downloadDoc}
              aria-label="下载文档"
            >
              <IoDownload /> 下载文档
            </button>
          </div>
        )}
        
        {isPdfViewable ? (
          <div className="viewer-doc-container">
            <iframe
              src={`${docUrl}#toolbar=0`}
              className="viewer-doc"
              title={fileName || '文档'}
              onLoad={handleDocLoad}
              onError={handleDocError}
            />
          </div>
        ) : (
          !isLoading && !error && (
            <div className="doc-download-container">
              <p>该文档类型无法直接预览，请下载后查看</p>
              <p className="doc-filename">{fileName}</p>
              <button 
                className="viewer-download-btn" 
                onClick={downloadDoc}
                aria-label="下载文档"
              >
                <IoDownload /> 下载文档
              </button>
            </div>
          )
        )}
      </div>
      
      {isPdfViewable && !error && !isLoading && (
        <div className="viewer-controls">
          <button 
            className="viewer-download-btn" 
            onClick={downloadDoc}
            aria-label="下载文档"
          >
            <IoDownload /> 下载文档
          </button>
        </div>
      )}
    </div>
  );
};

export default DocViewer; 