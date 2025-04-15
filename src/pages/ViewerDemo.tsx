import { useState } from 'react';
import FileViewer from '../components/viewers/FileViewer';
import { processFileSingle } from '../utils/fileUtils';
import '../styles/viewer-demo.css';

type FileItem = {
  id: string;
  name: string;
  url: string;
  type: string;
};

const ViewerDemo: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(false);

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    
    const uploadedFiles = Array.from(e.target.files);
    const newFiles: FileItem[] = [];
    
    for (const file of uploadedFiles) {
      try {
        // 处理文件，获取文件URL
        const result = await processFileSingle(file);
        
        if (result) {
          const newFileItem: FileItem = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            url: result,
            type: file.type || 'application/octet-stream'
          };
          
          newFiles.push(newFileItem);
        }
      } catch (error) {
        console.error('文件处理错误:', error);
      }
    }
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setLoading(false);
    
    // 清除文件输入，允许再次选择相同文件
    e.target.value = '';
  };

  // 打开文件查看器
  const openFileViewer = (file: FileItem) => {
    setViewingFile(file);
  };

  // 关闭文件查看器
  const closeFileViewer = () => {
    setViewingFile(null);
  };

  // 删除文件
  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  // 获取文件图标
  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type.includes('pdf')) {
      return '📄';
    } else if (type.includes('word') || type.includes('document')) {
      return '📝';
    } else if (type.includes('excel') || type.includes('sheet')) {
      return '📊';
    } else if (type.includes('presentation') || type.includes('powerpoint')) {
      return '📑';
    } else {
      return '📁';
    }
  };

  return (
    <div className="viewer-demo-container">
      <h1 className="viewer-demo-title">文件查看器演示</h1>
      
      <div className="file-upload-section">
        <label className="file-upload-label">
          <input 
            type="file" 
            multiple 
            onChange={handleFileUpload} 
            className="file-upload-input"
          />
          <span className="file-upload-button">选择文件</span>
        </label>
        <p className="file-upload-info">支持图片、PDF、文档等格式</p>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          <div className="loader"></div>
          <span>处理文件中...</span>
        </div>
      )}
      
      {files.length > 0 ? (
        <div className="file-grid">
          {files.map(file => (
            <div className="file-item" key={file.id}>
              <div 
                className="file-preview" 
                onClick={() => openFileViewer(file)}
              >
                {file.type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="file-thumbnail" />
                ) : (
                  <div className="file-icon">
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>
              <div className="file-info">
                <div className="file-name" title={file.name}>
                  {file.name}
                </div>
                <button
                  className="file-remove-btn"
                  onClick={() => removeFile(file.id)}
                  title="删除文件"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="empty-state">
            <p>没有文件，请上传文件进行查看</p>
          </div>
        )
      )}
      
      {viewingFile && (
        <FileViewer
          fileUrl={viewingFile.url}
          filename={viewingFile.name}
          mimeType={viewingFile.type}
          onClose={closeFileViewer}
        />
      )}
    </div>
  );
};

export default ViewerDemo; 