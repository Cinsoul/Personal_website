import React, { useState } from 'react';
import { getFileIcon } from '../utils/fileUtils';

interface DocumentViewerProps {
  dataUrl: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
}

/**
 * 文档查看器组件
 * 用于在线预览PDF等文档
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({ dataUrl, fileName, fileType, onClose }) => {
  const [loading, setLoading] = useState(true);
  
  // 检查是否是PDF文件
  const isPdf = fileType.toLowerCase().includes('pdf');
  
  // 处理文档加载完成
  const handleDocumentLoad = () => {
    setLoading(false);
  };
  
  // 处理键盘事件
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      {/* 顶部工具栏 */}
      <div className="bg-gray-800 w-full flex items-center justify-between p-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getFileIcon(fileType)}</span>
          <h3 className="text-white text-lg font-medium truncate max-w-md">{fileName}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <a 
            href={dataUrl} 
            download={fileName}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </a>
          
          <button 
            onClick={onClose}
            className="bg-gray-700 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
            aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 文档显示区域 */}
      <div className="flex-1 w-full relative overflow-auto bg-gray-200 dark:bg-gray-700">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        {isPdf ? (
          <iframe 
            src={dataUrl} 
            className="w-full h-full" 
            title={fileName}
            onLoad={handleDocumentLoad}
          />
        ) : (
          // 对于非PDF文件，提供下载选项
          <div className="flex items-center justify-center h-full flex-col p-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-lg">
              <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{fileName}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                无法直接在浏览器中预览此类型的文件。请下载后在相应的应用程序中查看。
              </p>
              <a 
                href={dataUrl} 
                download={fileName}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载文件
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer; 