import React, { useCallback, useState, useEffect } from 'react';
import ImageViewer from './ImageViewer';
import DocumentViewer from './DocumentViewer';

// 支持的图片类型
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

interface FileViewerProps {
  fileUrl: string;
  filename?: string; 
  mimeType?: string;
  onClose: () => void;
}

/**
 * 文件查看器组件
 * 根据文件类型自动选择合适的查看器
 */
const FileViewer: React.FC<FileViewerProps> = ({
  fileUrl,
  filename = '',
  mimeType = '',
  onClose
}) => {
  const [viewerType, setViewerType] = useState<'image' | 'document' | 'unknown'>('unknown');
  
  // 根据MIME类型确定查看器类型
  useEffect(() => {
    if (IMAGE_MIME_TYPES.includes(mimeType)) {
      setViewerType('image');
    } else if (mimeType) {
      setViewerType('document');
    } else {
      // 尝试通过文件扩展名猜测类型
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        setViewerType('image');
      } else {
        setViewerType('document');
      }
    }
  }, [mimeType, filename]);

  // 隐藏页面滚动，查看器关闭时恢复
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // 处理ESC键关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 根据类型渲染适当的查看器
  const renderViewer = () => {
    switch (viewerType) {
      case 'image':
        return (
          <ImageViewer
            imageUrl={fileUrl}
            altText={filename}
            onClose={onClose}
          />
        );
      case 'document':
      default:
        return (
          <DocumentViewer
            documentUrl={fileUrl}
            filename={filename}
            mimeType={mimeType}
            onClose={onClose}
          />
        );
    }
  };

  return renderViewer();
};

export default FileViewer; 