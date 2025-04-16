import React, { useState, useRef } from 'react';
import { compressImage } from '../utils/simpleImageUtils';
import { IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import '../styles/imageUploader.css';

interface ImageUploaderProps {
  onImageChange: (imageDataUrl: string, file: File) => void;
  initialImage?: string;
  uploadLabel?: string;
  className?: string;
  maxDimension?: number;
  quality?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageChange,
  initialImage = '',
  uploadLabel = '上传图片',
  className = '',
  maxDimension = 1200,
  quality = 0.8
}) => {
  const [imagePreview, setImagePreview] = useState<string>(initialImage);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setError('请上传有效的图片文件 (JPEG, PNG, GIF, WebP)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 使用Promise版本的compressImage
      const compressedImage = await compressImage(file, maxDimension, quality);
      setImagePreview(compressedImage);
      onImageChange(compressedImage, file);
    } catch (err) {
      setError('处理图片时出错，请重试');
      console.error('图片处理错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageChange('', new File([], ''));
  };

  return (
    <div className={`image-uploader ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="file-input"
      />
      
      {!imagePreview ? (
        <div className="upload-placeholder" onClick={triggerFileInput}>
          <div className="placeholder-content">
            <IoCloudUploadOutline className="upload-icon" />
            <span className="upload-text">{uploadLabel}</span>
          </div>
        </div>
      ) : (
        <div className="image-preview-container">
          <img src={imagePreview} alt="已上传图片" className="image-preview" />
          <div className="preview-actions">
            <button className="change-image-btn" onClick={triggerFileInput}>
              <IoImageOutline /> 更换图片
            </button>
            <button className="remove-image-btn" onClick={removeImage}>
              移除
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
          <span>处理图片中...</span>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ImageUploader; 