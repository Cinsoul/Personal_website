import React, { useState, useEffect } from 'react';
import '../styles/flippable-avatar.css';

interface FlippableAvatarProps {
  frontImagePath: string;
  backImagePath: string;
  altText: string;
  size?: number;
}

const FlippableAvatar: React.FC<FlippableAvatarProps> = ({ 
  frontImagePath, 
  backImagePath, 
  altText,
  size = 300
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontImgError, setFrontImgError] = useState(false);
  const [backImgError, setBackImgError] = useState(false);
  
  // 调试图片加载
  useEffect(() => {
    console.log('尝试加载图片:', frontImagePath, backImagePath);
    
    // 预加载图片
    const preloadFront = new Image();
    const preloadBack = new Image();
    
    preloadFront.onload = () => console.log('前面图片加载成功');
    preloadFront.onerror = () => console.error('前面图片加载失败');
    preloadBack.onload = () => console.log('背面图片加载成功');
    preloadBack.onerror = () => console.error('背面图片加载失败');
    
    preloadFront.src = frontImagePath;
    preloadBack.src = backImagePath;
  }, [frontImagePath, backImagePath]);

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="flipper">
        <div className="front">
          <div className="avatar-image-container">
            {!frontImgError ? (
              <img 
                src={frontImagePath}
                alt={`${altText} - 正面`}
                className="avatar-image"
                onError={() => {
                  console.error('前面图片加载错误');
                  setFrontImgError(true);
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="avatar-placeholder">
                {altText.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="back">
          <div className="avatar-image-container">
            {!backImgError ? (
              <img 
                src={backImagePath}
                alt={`${altText} - 背面`}
                className="avatar-image"
                onError={() => {
                  console.error('背面图片加载错误');
                  setBackImgError(true);
                }}
                crossOrigin="anonymous"
              />
            ) : (
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