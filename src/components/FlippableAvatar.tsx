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
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [avatar, setAvatar] = useState(frontImagePath);
  const [personalPhoto, setPersonalPhoto] = useState(backImagePath);
  
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

  const handleImageLoad = () => {
    setIsLoaded(true);
    setLoadError(false);
  };

  const handleImageError = () => {
    setIsLoaded(false);
    setLoadError(true);
  };

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="flipper">
        <div className="front">
          <div className="avatar-image-container">
            {isLoaded && !loadError ? (
              <img
                src={avatar}
                alt="抽象头像"
                className="avatar-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              loadError ? (
                <div className="avatar-placeholder">?</div>
              ) : (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="back">
          <div className="avatar-image-container full-body">
            {isLoaded && !loadError ? (
              <img
                src={personalPhoto}
                alt="个人照片"
                className="avatar-image full-body"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              loadError ? (
                <div className="avatar-placeholder">?</div>
              ) : (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableAvatar; 