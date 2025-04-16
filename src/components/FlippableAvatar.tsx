import React, { useState } from 'react';
import '../styles/flippable-avatar.css';

interface FlippableAvatarProps {
  frontImagePath: string;
  backImagePath: string;
  altText: string;
  size?: number;
}

// 简化图片路径处理
const getFullImagePath = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return path;
};

const FlippableAvatar: React.FC<FlippableAvatarProps> = ({ 
  frontImagePath, 
  backImagePath, 
  altText,
  size = 300
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontImgError, setFrontImgError] = useState(false);
  const [backImgError, setBackImgError] = useState(false);
  
  // 获取完整图片路径
  const frontPath = getFullImagePath(frontImagePath);
  const backPath = getFullImagePath(backImagePath);

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="flipper">
        <div className="front">
          <div className="avatar-image-container">
            <img 
              src={frontPath}
              alt={`${altText} - 正面`}
              className="avatar-image"
              onError={() => setFrontImgError(true)}
              style={{ display: frontImgError ? 'none' : 'block' }}
            />
            {frontImgError && (
              <div className="avatar-placeholder">
                {altText.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="back">
          <div className="avatar-image-container">
            <img 
              src={backPath}
              alt={`${altText} - 背面`}
              className="avatar-image"
              onError={() => setBackImgError(true)}
              style={{ display: backImgError ? 'none' : 'block' }}
            />
            {backImgError && (
              <div className="avatar-placeholder">
                {altText.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableAvatar; 