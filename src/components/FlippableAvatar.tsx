import React, { useState, useEffect } from 'react';
import '../styles/flippable-avatar.css';
import { getFallbackAvatarUrl, getFallbackPersonalPhotoUrl } from '../utils/imageUtils';

interface FlippableAvatarProps {
  frontImage: string;
  backImage: string;
  alt?: string;
  className?: string;
}

const FlippableAvatar: React.FC<FlippableAvatarProps> = ({ 
  frontImage, 
  backImage, 
  alt = '个人头像', 
  className = '' 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontLoading, setFrontLoading] = useState(true);
  const [backLoading, setBackLoading] = useState(true);
  const [frontImgSrc, setFrontImgSrc] = useState(frontImage);
  const [backImgSrc, setBackImgSrc] = useState(backImage);

  // 检查图片可访问性
  useEffect(() => {
    const checkImageAvailability = async () => {
      try {
        // 使用Image对象预加载图片
        const loadImage = (url: string) => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = url;
          });
        };

        try {
          await loadImage(frontImage);
          setFrontImgSrc(frontImage);
        } catch (error) {
          console.warn('无法加载正面头像图片，使用备用图片');
          setFrontImgSrc(getFallbackAvatarUrl());
        }

        try {
          await loadImage(backImage);
          setBackImgSrc(backImage);
        } catch (error) {
          console.warn('无法加载背面头像图片，使用备用图片');
          setBackImgSrc(getFallbackPersonalPhotoUrl());
        }
      } catch (error) {
        console.error('图片检查出错:', error);
      }
    };

    checkImageAvailability();
  }, [frontImage, backImage]);

  const handleFrontImageLoad = () => {
    setFrontLoading(false);
  };

  const handleBackImageLoad = () => {
    setBackLoading(false);
  };

  const handleFrontImageError = () => {
    console.warn('加载正面图片失败，使用备用图片');
    setFrontImgSrc(getFallbackAvatarUrl());
    setFrontLoading(false);
  };

  const handleBackImageError = () => {
    console.warn('加载背面图片失败，使用备用图片');
    setBackImgSrc(getFallbackPersonalPhotoUrl());
    setBackLoading(false);
  };

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''} ${className}`}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className="flipper">
        <div className="front">
          {frontLoading && (
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          )}
          <img 
            src={frontImgSrc} 
            alt={`${alt} - 正面`} 
            className="avatar-image"
            onLoad={handleFrontImageLoad}
            onError={handleFrontImageError}
          />
        </div>
        <div className="back">
          {backLoading && (
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          )}
          <img 
            src={backImgSrc} 
            alt={`${alt} - 背面`} 
            className="avatar-image"
            onLoad={handleBackImageLoad}
            onError={handleBackImageError}
          />
        </div>
      </div>
    </div>
  );
};

export default FlippableAvatar; 