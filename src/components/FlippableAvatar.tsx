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
  const [frontLoaded, setFrontLoaded] = useState(false);
  const [backLoaded, setBackLoaded] = useState(false);
  const [frontLoadError, setFrontLoadError] = useState(false);
  const [backLoadError, setBackLoadError] = useState(false);
  
  // 预加载图片
  useEffect(() => {
    console.log('尝试加载图片:', frontImagePath, backImagePath);
    
    const preloadFront = new Image();
    const preloadBack = new Image();
    
    preloadFront.onload = () => {
      console.log('前面图片加载成功');
      setFrontLoaded(true);
    };
    
    preloadFront.onerror = () => {
      console.error('前面图片加载失败');
      setFrontLoadError(true);
    };
    
    preloadBack.onload = () => {
      console.log('背面图片加载成功');
      setBackLoaded(true);
    };
    
    preloadBack.onerror = () => {
      console.error('背面图片加载失败');
      setBackLoadError(true);
    };
    
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
            {frontLoaded ? (
              <img
                src={frontImagePath}
                alt={altText + " (抽象头像)"}
                className="avatar-image"
              />
            ) : (
              frontLoadError ? (
                <div className="avatar-placeholder">图片加载失败</div>
              ) : (
                <div className="loading-placeholder">
                  <div className="loading-spinner"></div>
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="back">
          <div className="avatar-image-container">
            {backLoaded ? (
              <img
                src={backImagePath}
                alt={altText + " (个人照片)"}
                className="avatar-image"
              />
            ) : (
              backLoadError ? (
                <div className="avatar-placeholder">图片加载失败</div>
              ) : (
                <div className="loading-placeholder">
                  <div className="loading-spinner"></div>
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