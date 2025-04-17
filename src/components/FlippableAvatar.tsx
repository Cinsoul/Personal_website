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
  const [frontErrorDetails, setFrontErrorDetails] = useState('');
  const [backErrorDetails, setBackErrorDetails] = useState('');
  
  // 尝试多种路径直到图片加载成功
  useEffect(() => {
    console.log('尝试加载图片:', frontImagePath, backImagePath);
    
    const preloadFront = new Image();
    const preloadBack = new Image();
    
    preloadFront.onload = () => {
      console.log('前面图片加载成功:', frontImagePath);
      setFrontLoaded(true);
      setFrontLoadError(false);
    };
    
    preloadFront.onerror = (e) => {
      // 记录详细错误信息
      console.error('前面图片加载失败:', frontImagePath, e);
      const errorText = `无法加载图片: ${frontImagePath}`;
      setFrontErrorDetails(errorText);
      setFrontLoadError(true);
    };
    
    preloadBack.onload = () => {
      console.log('背面图片加载成功:', backImagePath);
      setBackLoaded(true);
      setBackLoadError(false);
    };
    
    preloadBack.onerror = (e) => {
      // 记录详细错误信息
      console.error('背面图片加载失败:', backImagePath, e);
      const errorText = `无法加载图片: ${backImagePath}`;
      setBackErrorDetails(errorText);
      setBackLoadError(true);
    };

    // 直接设置src会触发加载过程
    preloadFront.src = frontImagePath;
    preloadBack.src = backImagePath;
    
    // 如果图片已经缓存，onload可能不会触发，所以检查complete属性
    if (preloadFront.complete) {
      setFrontLoaded(true);
    }
    
    if (preloadBack.complete) {
      setBackLoaded(true);
    }
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
                className="avatar-image abstract-avatar"
              />
            ) : (
              frontLoadError ? (
                <div className="avatar-placeholder">
                  图片加载失败
                  <div className="error-details">{frontErrorDetails}</div>
                </div>
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
                className="avatar-image personal-photo"
              />
            ) : (
              backLoadError ? (
                <div className="avatar-placeholder">
                  图片加载失败
                  <div className="error-details">{backErrorDetails}</div>
                </div>
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