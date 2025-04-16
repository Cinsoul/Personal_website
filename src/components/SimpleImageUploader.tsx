import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { IoCloudUploadOutline, IoCloseCircle, IoRefresh } from 'react-icons/io5';
import '../styles/simpleImageUploader.css';

interface SimpleImageUploaderProps {
  onImageSelect: (imageData: string | null) => void;
  initialImage?: string | null;
  maxSizeInMB?: number;
  maxDimension?: number;
  quality?: number;
  label?: string;
  className?: string;
}

const SimpleImageUploader: React.FC<SimpleImageUploaderProps> = ({
  onImageSelect,
  initialImage = null,
  maxSizeInMB = 5,
  maxDimension = 1920,
  quality = 0.8,
  label = '上传图片',
  className = '',
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage !== imagePreview) {
      setImagePreview(initialImage);
    }
  }, [initialImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // 检查文件类型
    if (!validTypes.includes(file.type)) {
      setErrorMessage(`不支持的文件类型。请上传 JPEG, PNG, GIF 或 WebP 格式的图片。`);
      return;
    }
    
    // 检查文件大小
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setErrorMessage(`文件过大，请上传小于 ${maxSizeInMB}MB 的图片。`);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 调整图片大小如果需要
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 如果图片尺寸超过最大限制，等比例缩小
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 转换为base64
        const dataUrl = canvas.toDataURL(file.type, quality);
        setImagePreview(dataUrl);
        onImageSelect(dataUrl);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setErrorMessage('图片加载失败，请重试。');
        setIsLoading(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      setErrorMessage('读取文件时出错，请重试。');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null);
  };

  const handleRetryUpload = () => {
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`simple-image-uploader ${className} ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="file-input"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleImageChange}
        ref={fileInputRef}
      />

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>正在处理图片...</span>
        </div>
      ) : imagePreview ? (
        <div className="image-preview-container">
          <img src={imagePreview} alt="图片预览" className="image-preview" />
          <div className="image-actions">
            <button 
              type="button" 
              className="action-button retry-button" 
              onClick={handleRetryUpload}
              title="更换图片"
            >
              <IoRefresh />
            </button>
            <button 
              type="button" 
              className="action-button clear-button" 
              onClick={handleClearImage}
              title="删除图片"
            >
              <IoCloseCircle />
            </button>
          </div>
        </div>
      ) : (
        <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
          <IoCloudUploadOutline className="upload-icon" />
          <div className="upload-text">{label}</div>
          <div className="upload-info">
            点击或拖放图片文件到此处
            <br />
            支持 JPEG, PNG, GIF, WebP (最大 {maxSizeInMB}MB)
          </div>
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default SimpleImageUploader; 